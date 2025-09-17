import { tefpayNestHandler } from "../src/adapters/nest-adapter";

describe("tefpayNestHandler", () => {
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
    const mw = tefpayNestHandler;
    await mw(req, res, "SECRET", async (data) => data);
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
    const mw = tefpayNestHandler;
    await mw(req, res, "SECRET", async (data) => data);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
