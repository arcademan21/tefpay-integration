// Sistema de gestión de errores Tefpay
export class TefpayError extends Error {
  constructor(public code: string, public message: string) {
    super(message);
    this.name = "TefpayError";
  }
}

export const TefpayErrorMessages: Record<string, string> = {
  "0": "Transacción aprobada",
  "1": "Transacción denegada",
  // Agregar más códigos según documentación
};

export function getTefpayErrorMessage(code: string): string {
  return TefpayErrorMessages[code] || "Error desconocido";
}

/**
 * Traduce el código de error de Tefpay a una instancia de TefpayError
 */
export function tefpayErrorFromCode(code: string): TefpayError {
  return new TefpayError(code, getTefpayErrorMessage(code));
}
