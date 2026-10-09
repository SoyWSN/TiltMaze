/**
 * Autenticación biométrica (huella / Face ID) vía `expo-local-authentication`.
 */
import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricStatus = {
  /** El dispositivo tiene hardware biométrico. */
  compatible: boolean;
  /** Hay al menos una huella/rostro registrado. */
  enrolled: boolean;
  /** Tipos soportados (1 = huella, 2 = Face ID, …). */
  types: number[];
};

export async function checkBiometric(): Promise<BiometricStatus> {
  const [compatible, enrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  return { compatible, enrolled, types };
}

/** Muestra el diálogo del sistema y devuelve si el usuario se autenticó. */
export async function authenticate(reason = 'Desbloquea TiltMaze'): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar PIN',
    disableDeviceFallback: false,
  });
  return result.success;
}
