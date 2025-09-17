import { tefpayNestHandler } from "../src/adapters/nest-adapter";
const express = require("express");
import request from "supertest";

describe("Integración end-to-end Tefpay NestJS", () => {
  it("flujo completo: notificación, validación y respuesta", async () => {
    const app = express();
    app.use(require("express").json());
    app.post("/api/tefpay-notify", (req: any, res: any) => {
      tefpayNestHandler(req, res, "SECRET", async (data) => {
        if (
          data.event === "subscription_activated" &&
          data.status === "active"
        ) {
          return { success: true, action: "activate_subscription", ...data };
        }
        return { success: false, action: "unknown", ...data };
      });
    });
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
    // Simula una petición Express (NestJS) real
    const response = await request(app)
      .post("/api/tefpay-notify")
      .send(payload);
    expect(response.body).toMatchObject({
      success: true,
      action: "activate_subscription",
    });
  });
});
