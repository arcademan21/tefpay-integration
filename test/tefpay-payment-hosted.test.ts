import { TefpayPayment } from "../src/tefpay-payment";

describe("TefpayPayment.generateHostedPaymentForm", () => {
  const tefpay = new TefpayPayment({} as any);

  test("includes canonical Ds_Merchant_* hidden fields", () => {
    const html = tefpay.generateHostedPaymentForm({
      amount: "1000",
      merchantCode: "CODE",
      order: "ORDER-1",
      callbackUrl: "https://example.com/cb",
      urlOK: "https://example.com/ok",
      urlKO: "https://example.com/ko",
      secretKey: "SECRET",
      paymentGatewayUrl: "https://gateway.example/pay",
    });
    // Comprueba presencia de campos básicos
    expect(html).toContain("Ds_Merchant_Amount");
    expect(html).toContain("Ds_Merchant_MerchantCode");
    expect(html).toContain("Ds_Merchant_Order");
    expect(html).toContain("Ds_Merchant_UrlOK");
    expect(html).toContain("Ds_Merchant_UrlKO");
    expect(html).toContain("Ds_Merchant_Signature");
    expect(html).toContain("Ds_Merchant_TransactionType");
    expect(html).toContain("Ds_Merchant_Currency");
    expect(html).toContain("Ds_Merchant_Terminal");
    expect(html).toContain("Ds_Merchant_Lang");
  });

  test("params override default values", () => {
    const html = tefpay.generateHostedPaymentForm({
      amount: "2000",
      merchantCode: "CODE2",
      order: "ORDER-2",
      callbackUrl: "https://example.com/cb2",
      urlOK: "https://example.com/ok2",
      urlKO: "https://example.com/ko2",
      secretKey: "SECRET2",
      paymentGatewayUrl: "https://gateway.example/pay2",
      currency: "840",
      terminal: "99999999",
      locale: "fr",
      merchantSignature: "CUSTOMSIG",
    });
    expect(html).toContain('name="Ds_Merchant_Currency" value="840"');
    expect(html).toContain('name="Ds_Merchant_Terminal" value="99999999"');
    expect(html).toContain('name="Ds_Merchant_Lang" value="fr"');
    expect(html).toContain(
      'name="Ds_Merchant_MerchantSignature" value="CUSTOMSIG"'
    );
  });
});
