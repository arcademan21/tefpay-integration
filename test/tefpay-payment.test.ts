import { TefpayPayment } from "../src/tefpay-payment";
import { TefpayUtils } from "../src/tefpay-utils";

const clientMock = {
  merchantCode: "123456",
  secretKey: "CLAVESECRETA",
  environment: "integration",
} as any;

describe("TefpayPayment", () => {
  const payment = new TefpayPayment(clientMock);

  it("debe generar un formulario HTML válido para pagos hospedados", () => {
    const html = payment.generateHostedPaymentForm({
      amount: "1000",
      merchantCode: "123456",
      order: "ORD0001",
      callbackUrl: "https://miweb.com/callback",
      urlOK: "https://miweb.com/ok",
      urlKO: "https://miweb.com/ko",
      secretKey: "CLAVESECRETA",
      paymentGatewayUrl: "https://botest.tefpay.com/payments",
    });
    expect(html).toContain("<form");
    expect(html).toContain("Ds_Merchant_Amount");
    expect(html).toContain("Ds_Merchant_Signature");
    expect(html).toContain("submit");
  });

  it("limpia correctamente el email en el formulario de suscripción", () => {
    const html = payment.generateSubscriptionFormAndIframe({
      merchantCode: "123456",
      merchantSharedkey: "CLAVESECRETA",
      merchantTemplate: "TPL",
      paymentGatewayUrl: "https://botest.tefpay.com/payments",
      iframeScriptUrl: "https://botest.tefpay.com/iframe.js",
      iframeConfigureUrl: "https://botest.tefpay.com/configure",
      trialAmount: "1000",
      subscriptionAmount: "5000",
      notifyUrl: "https://miweb.com/notify",
      urlOK: "https://miweb.com/ok",
      urlKO: "https://miweb.com/ko",
      hostname: "https://miweb.com",
      locale: "es",
      userName: "Juan Pérez",
      userEmail: "áéíóúÜÑ@ejemplo.com",
    });
    expect(html).toContain("aeiouUN@ejemplo.com");
    expect(html).not.toContain("áéíóúÜÑ@ejemplo.com");
  });
});
