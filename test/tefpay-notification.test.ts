import { handleTefpayNotification } from "../src/tefpay-notification";

describe("handleTefpayNotification", () => {
  it("valida firma y procesa evento de activación", async () => {
    const body = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Merchant_Signature: "firma-correcta",
      Ds_Bank: "BANK",
      Ds_Response: "",
    };
    const result = await handleTefpayNotification(body, {
      secretKey: "SECRET",
      validateSignature: false,
      callback: async (data) => data,
    });
    expect(result.event).toBe("subscription_activated");
    expect(result.status).toBe("active");
  });

  it("detecta intento de cobro fallido", async () => {
    const body = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Merchant_Signature: "firma-correcta",
      Ds_Response: "denegado",
    };
    const result = await handleTefpayNotification(body, {
      secretKey: "SECRET",
      validateSignature: false,
      callback: async (data) => data,
    });
    expect(result.event).toBe("charge_attempt_failed");
    expect(result.status).toBe("failed");
  });

  it("valida error de firma", async () => {
    const body = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Merchant_Signature: "incorrecta",
      Ds_Response: "",
    };
    await expect(
      handleTefpayNotification(body, {
        secretKey: "SECRET",
        validateSignature: true,
        callback: async (data) => data,
      })
    ).rejects.toThrow("Firma de notificación inválida");
  });
});
