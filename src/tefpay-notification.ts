// Módulo para procesar notificaciones de Tefpay
import { TefpayUtils } from "./tefpay-utils";

export interface TefpayNotificationData {
  Ds_Merchant_Amount: string;
  Ds_Merchant_MerchantCode: string;
  Ds_Merchant_Order: string;
  Ds_Merchant_TransactionType: string;
  Ds_Merchant_Signature: string;
  Ds_Response: string;
  Ds_AuthorisationCode?: string;
  [key: string]: any;
}

export interface TefpayNotificationOptions {
  secretKey: string;
  validateSignature?: boolean;
  callback: (data: TefpayNotificationData) => Promise<any> | any;
}

/**
 * Procesa una notificación entrante de Tefpay.
 * Valida la firma y ejecuta la callback proporcionada.
 *
 * @param body - Objeto recibido en la petición (ej: req.body)
 * @param options - Opciones de configuración y callback
 * @returns Resultado de la callback o error
 *
 * @example
 * await handleTefpayNotification(req.body, {
 *   secretKey: "...",
 *   callback: async (data) => {
 *     // Lógica personalizada, por ejemplo, guardar en BD o llamar a backend
 *     return { status: "ok" };
 *   }
 * });
 */
export async function handleTefpayNotification(
  body: TefpayNotificationData,
  options: TefpayNotificationOptions
): Promise<any> {
  // Validaciones de robustez
  // 1. Chequeo de tamaño de body
  if (!body || typeof body !== "object" || Object.keys(body).length < 5) {
    throw new Error("Body de notificación incompleto o inválido");
  }
  // 2. Chequeo de campos obligatorios
  const requiredFields = [
    "Ds_Merchant_Amount",
    "Ds_Merchant_MerchantCode",
    "Ds_Merchant_Order",
    "Ds_Merchant_TransactionType",
    "Ds_Merchant_Signature",
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Campo obligatorio faltante: ${field}`);
    }
  }
  // 3. Validar firma si se requiere
  if (options.validateSignature !== false) {
    const expectedSignature = TefpayUtils.sha1(
      `${body.Ds_Merchant_Amount}${body.Ds_Merchant_MerchantCode}${body.Ds_Merchant_Order}${options.secretKey}`
    );
    if (body.Ds_Merchant_Signature !== expectedSignature) {
      throw new Error("Firma de notificación inválida");
    }
  }
  // 4. Validar tipo de evento soportado
  const validTransactionTypes = ["208", "209", "210", "211"];
  if (!validTransactionTypes.includes(body.Ds_Merchant_TransactionType)) {
    throw new Error("Tipo de transacción no soportado");
  }
  // Enriquecer el objeto con event y status
  let event = undefined;
  let status = undefined;
  // Activación de suscripción
  if (body.Ds_Merchant_TransactionType === "208" && body.Ds_Bank) {
    event = "subscription_activated";
    status = "active";
  } else if (body.Ds_Merchant_TransactionType === "208" && body.Ds_Response) {
    event = "charge_attempt_failed";
    status = "failed";
  }
  // Puedes añadir más lógica aquí para otros casos

  // Ejecutar la lógica personalizada con el objeto enriquecido
  return await options.callback({ ...body, event, status });
}

/**
 * Ejemplo de integración en una ruta API (Next.js, Express, etc.)
 *
 * import { handleTefpayNotification } from "./tefpay-notification";
 *
 * export default async function handler(req, res) {
 *   try {
 *     const result = await handleTefpayNotification(req.body, {
 *       secretKey: process.env.TEFPAY_SECRET_KEY!,
 *       callback: async (data) => {
 *         // Procesa la notificación y responde
 *         // Por ejemplo, llama a tu backend
 *         return { status: "ok" };
 *       }
 *     });
 *     res.status(200).json(result);
 *   } catch (err) {
 *     res.status(400).json({ error: err.message });
 *   }
 * }
 */
