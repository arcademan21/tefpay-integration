// Métodos para pagos, preautorizaciones, devoluciones, etc.
import { TefpayClient } from "./tefpay-client";
import { TefpayUtils } from "./tefpay-utils";

export class TefpayPayment {
  /**
   * Inicializa la clase TefpayPayment con la configuración del cliente.
   * @param client Instancia de TefpayClient con la configuración del comercio.
   */
  constructor(private client: TefpayClient) {}

  /**
   * Genera el formulario HTML y el script para cargar el iframe de Tefpay para suscripciones.
   * Este método está pensado para integraciones modernas (React, Next.js, etc.) y permite personalizar todos los campos relevantes.
   *
   * @param options - Objeto con todos los datos necesarios para la suscripción y la integración del iframe.
   * @param options.merchantCode - Código de comercio proporcionado por Tefpay.
   * @param options.merchantSharedkey - Clave secreta compartida del comercio.
   * @param options.merchantTemplate - Código de plantilla de Tefpay.
   * @param options.paymentGatewayUrl - URL del gateway de pago Tefpay.
   * @param options.iframeScriptUrl - URL del script JS que carga el iframe de Tefpay.
   * @param options.iframeConfigureUrl - URL de configuración para el iframe.
   * @param options.trialAmount - Importe de la prueba o primer cargo.
   * @param options.subscriptionAmount - Importe de la suscripción periódica.
   * @param options.notifyUrl - URL de notificación/callback para Tefpay.
   * @param options.urlOK - URL de retorno en caso de éxito.
   * @param options.urlKO - URL de retorno en caso de error.
   * @param options.hostname - Hostname del proyecto (para URLs).
   * @param options.locale - Idioma/localización (afecta terminal y textos).
   * @param options.userName - Nombre del cliente.
   * @param options.userEmail - Email del cliente.
   * @param options.templateNumber - (Opcional) Número de plantilla Tefpay.
   * @param options.additionalData - (Opcional) Datos adicionales para Tefpay.
   * @param options.terminal - (Opcional) Terminal de pago (por idioma).
   * @param options.terminalAuth - (Opcional) Terminal de autenticación.
   * @param options.matchingData - (Opcional) Identificador único de la transacción/suscripción.
   * @param options.subscriptionAccount - (Opcional) Cuenta de suscripción.
   * @param options.subscriptionDescription - (Opcional) Descripción de la suscripción.
   * @param options.paymentDescription - (Opcional) Descripción del pago.
   * @returns HTML string listo para renderizar en el frontend. Incluye el formulario y el script para cargar el iframe en el div #tefpayBox.
   *
   * @example
   * const html = tefpayPayment.generateSubscriptionFormAndIframe({
   *   merchantCode: "...",
   *   merchantSharedkey: "...",
   *   merchantTemplate: "...",
   *   paymentGatewayUrl: "...",
   *   iframeScriptUrl: "...",
   *   iframeConfigureUrl: "...",
   *   trialAmount: "1000",
   *   subscriptionAmount: "5000",
   *   notifyUrl: "https://.../notify",
   *   urlOK: "https://.../ok",
   *   urlKO: "https://.../ko",
   *   hostname: "https://...",
   *   locale: "es",
   *   userName: "Juan Pérez",
   *   userEmail: "juan@example.com"
   * });
   */
  generateSubscriptionFormAndIframe(options: {
    merchantCode: string;
    merchantSharedkey: string;
    merchantTemplate: string;
    paymentGatewayUrl: string;
    iframeScriptUrl: string;
    iframeConfigureUrl: string;
    trialAmount: string;
    subscriptionAmount: string;
    notifyUrl: string;
    urlOK: string;
    urlKO: string;
    hostname: string;
    locale: string;
    userName: string;
    userEmail: string;
    templateNumber?: string;
    additionalData?: string;
    terminal?: string;
    terminalAuth?: string;
    matchingData?: string;
    subscriptionAccount?: string;
    subscriptionDescription?: string;
    paymentDescription?: string;
  }): string {
    // Generar matchingData si no se proporciona
    const matchingData =
      options.matchingData ||
      String(new Date().toISOString().replace(/[^0-9]/g, "")).padEnd(21, "0");
    // Generar firma
    const signature = TefpayUtils.sha1(
      options.trialAmount +
        options.merchantCode +
        matchingData +
        options.notifyUrl +
        options.merchantSharedkey
    );
    // Terminales por idioma
    const terminals: { [key: string]: string } = {
      es: "00000001",
      it: "00000002",
      fr: "00000003",
      sv: "00000004",
      de: "00000005",
    };
    const terminal =
      options.terminal || terminals[options.locale] || terminals["es"];
    const terminalAuth = options.terminalAuth || terminal;
    // Descripciones
    const paymentDescription =
      options.paymentDescription || `NUEVO PAGO EN - /${options.locale} `;
    const subscriptionDescription =
      options.subscriptionDescription ||
      `NUEVA SUSCRIPCION EN - /${options.locale} `;
    // Campos del formulario
    const cleanedEmail = TefpayPayment.cleanEmailString(options.userEmail);
    const defaultSubscriptionFields = {
      Ds_Merchant_TransactionType: "6",
      Ds_Merchant_Subscription_ProcessingMethod: "201",
      Ds_Merchant_Subscription_Action: "C",
      Ds_Merchant_Currency: "978",
      Ds_Merchant_Amount: options.trialAmount,
      Ds_Merchant_Subscription_ChargeAmount: options.subscriptionAmount,
      Ds_Merchant_Subscription_RelFirstCharge: "02D",
      Ds_Merchant_Subscription_PeriodType: "M",
      Ds_Merchant_Subscription_PeriodInterval: "1",
      Ds_Merchant_Terminal: terminal,
      Ds_Merchant_TerminalAuth: terminalAuth,
      Ds_Merchant_Subscription_Iteration: "0",
      Ds_Merchant_Url: options.notifyUrl,
      Ds_Merchant_UrlOK: options.urlOK,
      Ds_Merchant_UrlKO: options.urlKO,
      Ds_Merchant_MerchantCode: options.merchantCode,
      Ds_Merchant_MerchantCodeTemplate: options.merchantTemplate,
      Ds_Merchant_TemplateNumber: options.templateNumber || "07",
      Ds_Merchant_AdditionalData: options.additionalData || "1",
      Ds_Merchant_MatchingData: matchingData,
      Ds_Merchant_MerchantSignature: signature,
      Ds_Merchant_Subscription_Account:
        options.subscriptionAccount || matchingData,
      Ds_Merchant_Subscription_ClientName: options.userName,
      Ds_Merchant_Subscription_ClientEmail: cleanedEmail,
      Ds_Merchant_Subscription_Description: subscriptionDescription,
      Ds_Merchant_Description: paymentDescription,
      Ds_Merchant_Subscription_NotifyCostumerByEmail: "0",
      Ds_Merchant_Lang: options.locale,
      Ds_Merchant_Subscription_Enable: "1",
    } as { [key: string]: string };
    const fields = TefpayPayment.buildHiddenFields(
      options,
      defaultSubscriptionFields
    );
    const inputs = fields
      .map((f) => `<input type='hidden' name='${f.name}' value='${f.value}' />`)
      .join("\n");
    // HTML del formulario y el div para el iframe
    return [
      `<form id='tefpayData' role='form' autoComplete='true'>`,
      inputs,
      `<div id='tefpayBox'></div>`,
      `</form>`,
      `<script src='${options.iframeScriptUrl}' async onload="if(window.TefpayIframe && TefpayIframe.init()){TefpayIframe.configure('${options.iframeConfigureUrl}', '100%');TefpayIframe.load();}"></script>`,
    ].join("\n");
  }

  /**
   * Limpia el email de caracteres acentuados y especiales según recomendación de Tefpay.
   * @param email Email a limpiar
   */
  private static cleanEmailString(email: string): string {
    if (!email) return "";
    let cleaned = email.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    cleaned = cleaned.replace(
      /[ÁÉÍÓÚÜÑáéíóúàèìòùÀÈÍÒÙüñ]/g,
      (match: string) => {
        const replacements: { [key: string]: string } = {
          Á: "A",
          É: "E",
          Í: "I",
          Ó: "O",
          Ú: "U",
          Ü: "U",
          Ñ: "N",
          á: "a",
          é: "e",
          í: "i",
          ó: "o",
          ú: "u",
          à: "a",
          è: "e",
          ì: "i",
          ò: "o",
          ù: "u",
          À: "A",
          È: "E",
          Ì: "I",
          Ò: "O",
          Ù: "U",
          ü: "u",
          ñ: "n",
        };
        return replacements[match] || match;
      }
    );
    cleaned = cleaned.replace(/\s+/g, "");
    return cleaned;
  }

  /**
   * Construye el array de hidden fields a partir de defaults y overrides en params.
   * Devuelve un array tipado de { name, value } listo para mapear a inputs.
   */
  private static buildHiddenFields(
    params: { [key: string]: string | undefined },
    defaults: { [key: string]: string }
  ): Array<{ name: string; value: string }> {
    const keys = Object.keys(defaults);
    const result: Array<{ name: string; value: string }> = [];
    for (const k of keys) {
      const paramKey = k as string;
      const override = (params && (params[paramKey] as string)) || undefined;
      const value =
        override !== undefined && override !== null ? override : defaults[k];
      result.push({ name: paramKey, value: String(value) });
    }
    return result;
  }

  /**
   * Realiza una transacción de cliente no presente (devolución, cobro recurrente, confirmación, etc.).
   * Utiliza el endpoint server-to-server de Tefpay.
   *
   * @param params - Parámetros de la transacción, incluyendo tipo, datos de coincidencia, fechas, importe, firma, etc.
   * @returns Promesa con la respuesta XML de Tefpay.
   *
   * @example
   * await tefpayPayment.serverToServerTransaction({
   *   transactionType: "4",
   *   matchingData: "...",
   *   date: "20250917",
   *   panMask: "...",
   *   merchantCode: "...",
   *   amount: "1000",
   *   signature: "...",
   *   url: "https://.../endpoint"
   * });
   */
  async serverToServerTransaction(params: {
    transactionType: string;
    matchingData: string;
    date: string;
    panMask: string;
    merchantCode: string;
    amount: string;
    signature: string;
    url: string;
    [key: string]: string;
  }): Promise<string> {
    const body = new URLSearchParams({
      Ds_Merchant_TransactionType: params.transactionType,
      Ds_Merchant_MatchingData: params.matchingData,
      Ds_Date: params.date,
      Ds_Merchant_PanMask: params.panMask,
      Ds_Merchant_MerchantCode: params.merchantCode,
      Ds_Merchant_Amount: params.amount,
      Ds_Merchant_MerchantSignature: params.signature,
      ...params,
    }).toString();
    const response = await fetch(params.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return await response.text();
  }

  /**
   * Realiza una devolución de una transacción previa.
   * Calcula la firma y llama a serverToServerTransaction con los parámetros adecuados.
   *
   * @param params - Parámetros necesarios para la devolución (datos de coincidencia, fecha, importe, clave secreta, etc.).
   * @returns Promesa con la respuesta XML de Tefpay.
   *
   * @example
   * await tefpayPayment.refund({
   *   matchingData: "...",
   *   date: "20250917",
   *   panMask: "...",
   *   merchantCode: "...",
   *   amount: "1000",
   *   secretKey: "...",
   *   url: "https://.../endpoint"
   * });
   */
  async refund(params: {
    matchingData: string;
    date: string;
    panMask: string;
    merchantCode: string;
    amount: string;
    secretKey: string;
    url: string;
  }): Promise<string> {
    const signature = TefpayUtils.sha1(
      `${params.amount}${params.merchantCode}${params.matchingData}${params.url}${params.secretKey}`
    );
    return this.serverToServerTransaction({
      transactionType: "4", // Devolución
      matchingData: params.matchingData,
      date: params.date,
      panMask: params.panMask,
      merchantCode: params.merchantCode,
      amount: params.amount,
      signature,
      url: params.url,
    });
  }

  /**
   * Genera el formulario HTML POST para pagos de cliente presente (página hospedada).
   * Este método está pensado para pagos únicos y directos, no suscripciones.
   *
   * @param params - Parámetros de la transacción, incluyendo importe, código de comercio, orden, URLs de retorno, clave secreta, etc.
   * @returns HTML string del formulario listo para renderizar y enviar automáticamente.
   *
   * @example
   * const html = tefpayPayment.generateHostedPaymentForm({
   *   amount: "1000",
   *   merchantCode: "...",
   *   order: "ORD123",
   *   callbackUrl: "https://.../notify",
   *   urlOK: "https://.../ok",
   *   urlKO: "https://.../ko",
   *   secretKey: "...",
   *   paymentGatewayUrl: "https://.../gateway"
   * });
   */
  generateHostedPaymentForm(params: {
    amount: string;
    merchantCode: string;
    order: string;
    callbackUrl: string;
    urlOK: string;
    urlKO: string;
    secretKey: string;
    paymentGatewayUrl: string;
    transactionType?: string;
    [key: string]: string | undefined;
  }): string {
    const signature = TefpayUtils.signPaymentRequest(
      params.amount,
      params.merchantCode,
      params.order,
      params.callbackUrl,
      params.secretKey
    );
    // Conjunto completo de campos hidden por defecto. Los valores pueden ser
    // sobrescritos por propiedades en `params` si se proporcionan.
    const defaultHostedFields = {
      Ds_Merchant_Amount: params.amount,
      Ds_Merchant_Currency: params.currency || "978",
      Ds_Merchant_MerchantCode: params.merchantCode,
      Ds_Merchant_Order: params.order,
      Ds_Merchant_TransactionType: params.transactionType || "201",
      Ds_Merchant_Url: params.callbackUrl || params.url || "",
      Ds_Merchant_UrlOK: params.urlOK || "",
      Ds_Merchant_UrlKO: params.urlKO || "",
      Ds_Merchant_Signature: signature,
      Ds_Merchant_Terminal: params.terminal || "00000001",
      Ds_Merchant_AdditionalData: params.additionalData || "",
      Ds_Merchant_MatchingData: params.matchingData || "",
      Ds_Merchant_TemplateNumber: params.templateNumber || "",
      Ds_Merchant_MerchantCodeTemplate: params.merchantTemplate || "",
      Ds_Merchant_MerchantData: params.merchantData || "",
      Ds_Merchant_Lang: params.locale || params.lang || "es",
      Ds_Merchant_MerchantSignature: params.merchantSignature || signature,
    } as { [key: string]: string };
    const fields = TefpayPayment.buildHiddenFields(params, defaultHostedFields);
    const inputs = fields
      .map((f) => `<input type="hidden" name="${f.name}" value="${f.value}" />`)
      .join("\n");
    return `
      <form id="tefpay-payment-form" action="${params.paymentGatewayUrl}" method="POST">
        ${inputs}
        <noscript><input type="submit" value="Pagar" /></noscript>
      </form>
      <script>document.getElementById('tefpay-payment-form').submit();</script>
    `;
  }
}
