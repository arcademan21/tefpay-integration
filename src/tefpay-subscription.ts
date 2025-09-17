// Métodos para gestión remota de suscripciones
import { TefpayClient } from "./tefpay-client";
import { TefpayUtils } from "./tefpay-utils";

export class TefpaySubscription {
  constructor(private client: TefpayClient) {}

  /**
   * Realiza una operación sobre la API de suscripciones de Tefpay
   * @param params Parámetros de la suscripción
   * @returns Promesa con la respuesta XML de Tefpay
   */
  async manageSubscription(params: {
    account: string;
    action: string; // C, SP, O, D, X
    merchantCode: string;
    secretKey: string;
    url: string;
    [key: string]: string;
  }): Promise<string> {
    const signature = TefpayUtils.signSubscription(
      params.account,
      params.action,
      params.merchantCode,
      params.secretKey
    );
    const body = new URLSearchParams({
      Ds_Merchant_Subscription_Account: params.account,
      Ds_Merchant_Subscription_Action: params.action,
      Ds_Merchant_MerchantCode: params.merchantCode,
      Ds_Signature: signature,
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
   * Alta de suscripción (Create)
   * @param params Parámetros necesarios para crear la suscripción
   * @returns Promesa con la respuesta XML de Tefpay
   */
  async create(params: {
    account: string;
    merchantCode: string;
    secretKey: string;
    url: string;
  }): Promise<string> {
    return this.manageSubscription({
      account: params.account,
      action: "C",
      merchantCode: params.merchantCode,
      secretKey: params.secretKey,
      url: params.url,
    });
  }

  /**
   * Suspender suscripción (Suspend)
   * @param params Parámetros necesarios para suspender la suscripción
   * @returns Promesa con la respuesta XML de Tefpay
   */
  async suspend(params: {
    account: string;
    merchantCode: string;
    secretKey: string;
    url: string;
  }): Promise<string> {
    return this.manageSubscription({
      account: params.account,
      action: "S",
      merchantCode: params.merchantCode,
      secretKey: params.secretKey,
      url: params.url,
    });
  }

  /**
   * Reactivar suscripción (Reactivate)
   * @param params Parámetros necesarios para reactivar la suscripción
   * @returns Promesa con la respuesta XML de Tefpay
   */
  async reactivate(params: {
    account: string;
    merchantCode: string;
    secretKey: string;
    url: string;
  }): Promise<string> {
    return this.manageSubscription({
      account: params.account,
      action: "R",
      merchantCode: params.merchantCode,
      secretKey: params.secretKey,
      url: params.url,
    });
  }

  /**
   * Baja definitiva de suscripción (Cancel/Delete)
   * @param params Parámetros necesarios para cancelar la suscripción
   * @returns Promesa con la respuesta XML de Tefpay
   */
  async cancel(params: {
    account: string;
    merchantCode: string;
    secretKey: string;
    url: string;
  }): Promise<string> {
    return this.manageSubscription({
      account: params.account,
      action: "B",
      merchantCode: params.merchantCode,
      secretKey: params.secretKey,
      url: params.url,
    });
  }

  /**
   * Ejemplo: Actualizar suscripción
   */
  async update(params: {
    account: string;
    merchantCode: string;
    secretKey: string;
    url: string;
    chargeAmount?: string;
    chargeDate?: string;
    email?: string;
  }): Promise<string> {
    return this.manageSubscription({
      account: params.account,
      action: "X",
      merchantCode: params.merchantCode,
      secretKey: params.secretKey,
      url: params.url,
      Ds_Merchant_Subscription_ChargeAmount: params.chargeAmount || "",
      Ds_Merchant_Subscription_ChargeDate: params.chargeDate || "",
      Ds_Merchant_Subscription_Email: params.email || "",
    });
  }
}
