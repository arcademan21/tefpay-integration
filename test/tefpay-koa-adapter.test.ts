import { tefpayKoaMiddleware } from "../src/adapters/koa-adapter";

describe("tefpayKoaMiddleware", () => {
  it("procesa notificación correctamente", async () => {
    const ctx: any = {
      request: {
        body: {
          Ds_Merchant_Amount: "1000",
          Ds_Merchant_MerchantCode: "CODE",
          Ds_Merchant_Order: "ORDER",
          Ds_Merchant_TransactionType: "208",
          Ds_Merchant_Signature: "firma",
          Ds_Bank: "BANK",
        },
      },
      body: undefined,
      status: undefined,
    };
    const next = jest.fn();
    const mw = tefpayKoaMiddleware("SECRET", async (data) => data);
    await mw(ctx, next);
    expect(ctx.body).toBeDefined();
  });

  it("devuelve error si la firma es inválida", async () => {
    const ctx: any = {
      request: {
        body: {
          Ds_Merchant_Amount: "1000",
          Ds_Merchant_MerchantCode: "CODE",
          Ds_Merchant_Order: "ORDER",
          Ds_Merchant_TransactionType: "208",
          Ds_Merchant_Signature: "incorrecta",
        },
      },
      body: undefined,
      status: undefined,
    };
    const next = jest.fn();
    const mw = tefpayKoaMiddleware("SECRET", async (data) => data);
    await mw(ctx, next);
    expect(ctx.status).toBe(400);
    expect(ctx.body).toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
