import { tefpayFastifyHandler } from "../src/adapters/fastify-adapter";

describe("tefpayFastifyHandler", () => {
  it("procesa notificación correctamente", async () => {
    const request: any = {
      body: {
        Ds_Merchant_Amount: "1000",
        Ds_Merchant_MerchantCode: "CODE",
        Ds_Merchant_Order: "ORDER",
        Ds_Merchant_TransactionType: "208",
        Ds_Merchant_Signature: "firma",
        Ds_Bank: "BANK",
      },
    };
    const reply: any = { send: jest.fn(), status: jest.fn().mockReturnThis() };
    const mw = tefpayFastifyHandler("SECRET", async (data) => data);
    await mw(request, reply);
    expect(reply.send).toHaveBeenCalled();
  });

  it("devuelve error si la firma es inválida", async () => {
    const request: any = {
      body: {
        Ds_Merchant_Amount: "1000",
        Ds_Merchant_MerchantCode: "CODE",
        Ds_Merchant_Order: "ORDER",
        Ds_Merchant_TransactionType: "208",
        Ds_Merchant_Signature: "incorrecta",
      },
    };
    const reply: any = { send: jest.fn(), status: jest.fn().mockReturnThis() };
    const mw = tefpayFastifyHandler("SECRET", async (data) => data);
    await mw(request, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
