/**
 * Módulo de sensores de TiltMaze.
 * Convierte el acelerómetro en un vector de inclinación calibrado,
 * listo para alimentar la física del juego (src/game/engine.ts, día 2).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

/** Intervalo de actualización del sensor: ~60 fps, lo que usará el juego. */
export const SENSOR_INTERVAL_MS = 16;

export type TiltVector = {
  /** Inclinación horizontal en [-1, 1]: negativa = hacia la izquierda. */
  x: number;
  /** Inclinación vertical en [-1, 1]: positiva = hacia abajo. */
  y: number;
};

export type TiltState = {
  /** Medición cruda del acelerómetro (en g), null hasta el primer evento. */
  data: AccelerometerMeasurement | null;
  /** Inclinación calibrada y escalada por la sensibilidad. */
  tilt: TiltVector;
  /** Offset capturado con calibrar(): la postura "neutra" del jugador. */
  neutral: TiltVector;
  /** Multiplicador de sensibilidad (1 = neutro). */
  sensitivity: number;
  /** true si el dispositivo tiene acelerómetro. */
  available: boolean;
  /** Captura la inclinación actual como neutra (botón "centrar"). */
  calibrate: () => void;
  setSensitivity: (value: number) => void;
};

const NEUTRAL_DEFAULT: TiltVector = { x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Hook principal del control del juego.
 *
 * La calibración captura la inclinación actual como "neutra", de modo que
 * se puede jugar en cualquier postura (p.ej. semi-recostado) y facilita
 * la demostración: se pulsa "centrar" y desde ahí la bola responde.
 */
export function useTilt(initialSensitivity = 1): TiltState {
  const [data, setData] = useState<AccelerometerMeasurement | null>(null);
  const [available, setAvailable] = useState(true);
  const [neutral, setNeutral] = useState<TiltVector>(NEUTRAL_DEFAULT);
  const [sensitivity, setSensitivity] = useState(initialSensitivity);
  const dataRef = useRef<AccelerometerMeasurement | null>(null);

  useEffect(() => {
    let mounted = true;
    Accelerometer.isAvailableAsync().then((isAvailable) => {
      if (mounted) {
        setAvailable(isAvailable);
      }
    });
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    const subscription = Accelerometer.addListener((measurement) => {
      dataRef.current = measurement;
      setData(measurement);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const calibrate = useCallback(() => {
    const current = dataRef.current;
    if (!current) {
      return;
    }
    setNeutral({ x: current.x, y: current.y });
  }, []);

  const tilt: TiltVector = data
    ? {
        // Expo reports the horizontal acceleration sign opposite to the
        // direction the board should roll on this device orientation.
        // Normalize it here so negative x means "move the ball left".
        x: clamp((neutral.x - data.x) * sensitivity, -1, 1),
        y: clamp((data.y - neutral.y) * sensitivity, -1, 1),
      }
    : NEUTRAL_DEFAULT;

  return { data, tilt, neutral, sensitivity, available, calibrate, setSensitivity };
}
