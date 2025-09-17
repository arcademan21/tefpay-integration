import { tefpayFastifyHandler } from "../src/adapters/fastify-adapter";
import fastify from "fastify";

describe("Integración end-to-end Tefpay Fastify", () => {
  it("flujo completo: notificación, validación y respuesta", async () => {
    // Solución para error de tipo: usar fastify() como función
    // Si el import default falla, prueba con fastify.default()
    const app =
      typeof fastify === "function" ? fastify() : (fastify as any).default();
    app.post(
      "/api/tefpay-notify",
      tefpayFastifyHandler("SECRET", async (data) => {
        if (
          data.event === "subscription_activated" &&
          data.status === "active"
        ) {
          return { success: true, action: "activate_subscription", ...data };
        }
        return { success: false, action: "unknown", ...data };
      })
    );
    // Genera la firma válida para el payload
    const payload: any = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Bank: "BANK",
      Ds_Merchant_Signature: "", // Se asigna abajo
    };
    // La firma se calcula como sha1(amount + merchantCode + order + secretKey)
    // Usamos la misma clave que el handler: "SECRET"
    const { TefpayUtils } = require("../src/tefpay-utils");
    payload.Ds_Merchant_Signature = TefpayUtils.sha1(
      payload.Ds_Merchant_Amount +
        payload.Ds_Merchant_MerchantCode +
        payload.Ds_Merchant_Order +
        "SECRET"
    );
    // Simula una petición Fastify real
    const response = await app.inject({
      method: "POST",
      url: "/api/tefpay-notify",
      payload,
    });
    expect(response.json()).toMatchObject({
      success: true,
      action: "activate_subscription",
    });
  });
});
