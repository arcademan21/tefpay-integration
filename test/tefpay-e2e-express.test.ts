import { handleTefpayNotification } from "../src/tefpay-notification";
import { tefpayExpressMiddleware } from "../src/adapters/express-adapter";

describe("Integración end-to-end Tefpay Express", () => {
  it("flujo completo: notificación, validación y respuesta", async () => {
    // Simula una petición Express real
    const { TefpayUtils } = require("../src/tefpay-utils");
    const body: any = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Bank: "BANK",
    };
    body.Ds_Merchant_Signature = TefpayUtils.sha1(
      body.Ds_Merchant_Amount +
        body.Ds_Merchant_MerchantCode +
        body.Ds_Merchant_Order +
        "SECRET"
    );
    const req: any = { body };
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const mw = tefpayExpressMiddleware("SECRET", async (data) => {
      // Simula lógica de negocio
      if (data.event === "subscription_activated" && data.status === "active") {
        return { success: true, action: "activate_subscription", ...data };
      }
      return { success: false, action: "unknown", ...data };
    });
    await mw(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        action: "activate_subscription",
      })
    );
  });
});
