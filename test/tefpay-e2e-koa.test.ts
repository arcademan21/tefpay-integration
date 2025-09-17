import Koa from "koa";
import bodyParser from "koa-bodyparser";
import request from "supertest";
import { tefpayKoaMiddleware } from "../src/adapters/koa-adapter";

describe("Integración end-to-end Tefpay Koa", () => {
  it("flujo completo: notificación, validación y respuesta", async () => {
    const app = new (Koa as any).default();
    app.use(bodyParser());
    app.use(
      tefpayKoaMiddleware("SECRET", async (data) => {
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
      Ds_Merchant_Signature: "",
    };
    const { TefpayUtils } = require("../src/tefpay-utils");
    payload.Ds_Merchant_Signature = TefpayUtils.sha1(
      payload.Ds_Merchant_Amount +
        payload.Ds_Merchant_MerchantCode +
        payload.Ds_Merchant_Order +
        "SECRET"
    );
    // Simula una petición Koa real
    const response = await request(app.callback())
      .post("/api/tefpay-notify")
      .send(payload);
    expect(response.body).toMatchObject({
      success: true,
      action: "activate_subscription",
    });
  });
});
