#!/usr/bin/env node
/**
 * Entorno de desarrollo de TiltMaze en UNA sola terminal.
 *
 *   npm run dev
 *
 * Levanta a la vez:
 *   [stripe]   reenvía los pagos de Stripe al webhook local
 *   [firebase] emulador de Cloud Functions (el webhook)
 *   [expo]     servidor de desarrollo (dev client)
 *
 * El secreto `whsec_...` se detecta automáticamente de la salida de `stripe listen`
 * y se inyecta en el emulador, así no hay que copiarlo a mano. Ctrl+C detiene todo.
 *
 * Flags:
 *   --dry-run   valida y muestra los comandos, sin ejecutarlos.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = process.argv.includes('--dry-run');

const PROJECT_ID = 'tiltmaze-726ca';
const SERVICE_ACCOUNT = path.join(ROOT, 'functions', 'serviceAccountKey.json');
const WEBHOOK_URL = `http://localhost:5001/${PROJECT_ID}/us-central1/stripeWebhook`;

const STRIPE_CMD = `stripe listen --forward-to ${WEBHOOK_URL} --events checkout.session.completed`;
const FIREBASE_CMD = `firebase emulators:start --only functions --project ${PROJECT_ID}`;
const EXPO_CMD = 'npx expo start --dev-client';

const COLOR = { stripe: '\x1b[35m', firebase: '\x1b[33m', expo: '\x1b[36m', dev: '\x1b[32m' };
const RESET = '\x1b[0m';
const children = [];
let shuttingDown = false;

const say = (msg) => process.stdout.write(`${COLOR.dev}[dev]${RESET} ${msg}\n`);
const label = (name, line) =>
  process.stdout.write(`${COLOR[name]}${`[${name}]`.padEnd(10)}${RESET} ${line}\n`);

function killTree(child) {
  if (!child || child.exitCode !== null) {
    return;
  }
  if (process.platform === 'win32') {
    // Los procesos se lanzan con shell, así que hay que matar el árbol completo.
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  say('Cerrando procesos…');
  for (const child of children) {
    killTree(child);
  }
  setTimeout(() => process.exit(code), 700);
}

function track(child, name) {
  children.push(child);
  child.on('exit', (code) => {
    if (!shuttingDown) {
      say(`${name} terminó (código ${code ?? 0}).`);
    }
  });
  child.on('error', (error) => {
    if (!shuttingDown) {
      say(`${name} no se pudo iniciar: ${error.message}`);
    }
  });
  return child;
}

/** Ejecuta un comando y prefija cada línea de su salida. */
function runPiped(name, command, { env, onLine } = {}) {
  const child = track(
    spawn(command, { cwd: ROOT, shell: true, env: { ...process.env, ...env } }),
    name,
  );
  let buffer = '';
  const consume = (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      label(name, line);
      onLine?.(line);
    }
  };
  child.stdout?.on('data', consume);
  child.stderr?.on('data', consume);
  return child;
}

/** Ejecuta un comando heredando la terminal (así Expo conserva el QR del dev client). */
function runInherit(name, command, env) {
  return track(
    spawn(command, { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, ...env } }),
    name,
  );
}

// ── Validaciones ────────────────────────────────────────────────────────────
if (!existsSync(SERVICE_ACCOUNT)) {
  say(`❌ Falta ${path.relative(ROOT, SERVICE_ACCOUNT)}.`);
  say('Descárgalo en Firebase → Project settings → Service accounts → Generate new private key.');
  process.exit(1);
}

if (DRY_RUN) {
  say('Dry run — se ejecutarían estos comandos:');
  say(`  stripe   -> ${STRIPE_CMD}`);
  say(`  firebase -> ${FIREBASE_CMD}`);
  say(`              (env: GOOGLE_APPLICATION_CREDENTIALS, STRIPE_WEBHOOK_SECRET, FUNCTIONS_DISCOVERY_TIMEOUT=120)`);
  say(`  expo     -> ${EXPO_CMD}`);
  process.exit(0);
}

// ── Arranque ────────────────────────────────────────────────────────────────
say('Levantando Stripe, Firebase y Expo… (Ctrl+C para detener todo)');

let firebaseStarted = false;
function startFirebase(secret) {
  if (firebaseStarted) {
    return;
  }
  firebaseStarted = true;
  say(
    secret
      ? 'Secreto de Stripe detectado; arrancando el emulador con él.'
      : '⚠️  Sin secreto de Stripe: el webhook responderá 500 hasta que lo configures.',
  );
  runPiped('firebase', FIREBASE_CMD, {
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: SERVICE_ACCOUNT,
      FUNCTIONS_DISCOVERY_TIMEOUT: process.env.FUNCTIONS_DISCOVERY_TIMEOUT ?? '120',
      ...(secret ? { STRIPE_WEBHOOK_SECRET: secret } : {}),
    },
  });
}

// Expo primero: hereda la terminal y mantiene el QR del dev client.
runInherit('expo', EXPO_CMD);

// Stripe: al detectar el `whsec_...`, arranca el emulador con él.
runPiped('stripe', STRIPE_CMD, {
  onLine: (line) => {
    const match = line.match(/whsec_[A-Za-z0-9]+/);
    if (match) {
      startFirebase(match[0]);
    }
  },
});

// Red de seguridad: si en 20 s no se detectó el secreto, arranca igual.
setTimeout(() => {
  if (!firebaseStarted) {
    startFirebase(process.env.STRIPE_WEBHOOK_SECRET);
  }
}, 20000).unref();

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
