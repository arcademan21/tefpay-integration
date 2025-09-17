import { tefpayExpressMiddleware } from "../src/adapters/express-adapter";
import { handleTefpayNotification } from "../src/tefpay-notification";

describe("tefpayExpressMiddleware", () => {
  it("procesa notificación correctamente", async () => {
    const req: any = {
      body: {
        Ds_Merchant_Amount: "1000",
        Ds_Merchant_MerchantCode: "CODE",
        Ds_Merchant_Order: "ORDER",
        Ds_Merchant_TransactionType: "208",
        Ds_Merchant_Signature: "firma",
        Ds_Bank: "BANK",
      },
    };
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const mw = tefpayExpressMiddleware("SECRET", async (data) => data);
    await mw(req, res, next);
    expect(res.json).toHaveBeenCalled();
  });

  it("devuelve error si la firma es inválida", async () => {
    const req: any = {
      body: {
        Ds_Merchant_Amount: "1000",
        Ds_Merchant_MerchantCode: "CODE",
        Ds_Merchant_Order: "ORDER",
        Ds_Merchant_TransactionType: "208",
        Ds_Merchant_Signature: "incorrecta",
      },
    };
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    const next = jest.fn();
    const mw = tefpayExpressMiddleware("SECRET", async (data) => data);
    await mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
