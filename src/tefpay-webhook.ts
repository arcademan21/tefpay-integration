// Gestión y verificación de callbacks
import { TefpayClient } from "./tefpay-client";
import { TefpayUtils } from "./tefpay-utils";

export class TefpayWebhookHandler {
  constructor(private client: TefpayClient) {}

  /**
   * Verifica la firma de la respuesta recibida en el callback de Tefpay
   * @param callbackData Datos recibidos en el callback
   * @param secretKey Clave secreta del comercio
   * @returns true si la firma es válida, false si no
   */
  verifyCallbackSignature(
    callbackData: {
      Ds_Amount: string;
      Ds_Merchant_MatchingData: string;
      Ds_AuthorisationCode: string;
      Ds_Merchant_TransactionType: string;
      Ds_Date: string;
      Ds_Signature: string;
    },
    secretKey: string
  ): boolean {
    const expectedSignature = TefpayUtils.signCallbackResponse(
      callbackData.Ds_Amount,
      callbackData.Ds_Merchant_MatchingData,
      callbackData.Ds_AuthorisationCode,
      callbackData.Ds_Merchant_TransactionType,
      callbackData.Ds_Date,
      secretKey
    );
    return expectedSignature === callbackData.Ds_Signature;
  }

  /**
   * Procesa el callback y devuelve el resultado validado
   * @param callbackData Datos recibidos en el callback
   * @param secretKey Clave secreta del comercio
   * @returns Objeto con estado y datos relevantes
   */
  handleCallback(
    callbackData: any,
    secretKey: string
  ): {
    valid: boolean;
    data: any;
    error?: string;
  } {
    const valid = this.verifyCallbackSignature(callbackData, secretKey);
    if (!valid) {
      return { valid: false, data: callbackData, error: "Firma inválida" };
    }
    return { valid: true, data: callbackData };
  }
}
