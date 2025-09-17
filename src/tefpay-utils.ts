// Utilidades para cálculo y verificación de firmas SHA-1
import sha1 from "sha1";

export class TefpayUtils {
  static sha1(data: string): string {
    return sha1(data);
  }

  /**
   * Calcula la firma para una petición de pago (cliente presente)
   * @param amount Importe
   * @param merchantCode Código de comercio
   * @param order Número de pedido
   * @param callbackUrl URL de callback
   * @param secretKey Clave secreta
   */
  static signPaymentRequest(
    amount: string,
    merchantCode: string,
    order: string,
    callbackUrl: string,
    secretKey: string
  ): string {
    const data = `${amount}${merchantCode}${order}${callbackUrl}${secretKey}`;
    return sha1(data);
  }

  /**
   * Calcula la firma para la respuesta del callback
   * @param amount Importe
   * @param matchingData Datos de coincidencia
   * @param authCode Código de autorización
   * @param transactionType Tipo de transacción
   * @param date Fecha
   * @param secretKey Clave secreta
   */
  static signCallbackResponse(
    amount: string,
    matchingData: string,
    authCode: string,
    transactionType: string,
    date: string,
    secretKey: string
  ): string {
    const data = `${amount}${matchingData}${authCode}${transactionType}${date}${secretKey}`;
    return sha1(data);
  }

  /**
   * Calcula la firma para la API de suscripciones
   * @param account Cuenta de suscripción
   * @param action Acción de suscripción
   * @param merchantCode Código de comercio
   * @param secretKey Clave secreta
   */
  static signSubscription(
    account: string,
    action: string,
    merchantCode: string,
    secretKey: string
  ): string {
    const data = `${account}${action}${merchantCode}${secretKey}`;
    return sha1(data);
  }

  // Otros métodos de utilidad
}
