import { TefpayPayment } from "../src/tefpay-payment";

describe("TefpayPayment.generateSubscriptionFormAndIframe", () => {
  it("genera campos por defecto y firma, y permite overrides", () => {
    const payment = new TefpayPayment({} as any);

    const html = payment.generateSubscriptionFormAndIframe({
      merchantCode: "TEST",
      merchantSharedkey: "SECRET",
      merchantTemplate: "TMP",
      paymentGatewayUrl: "https://gw/",
      iframeScriptUrl: "https://gw/iframe.js",
      iframeConfigureUrl: "https://gw/config",
      trialAmount: "100",
      subscriptionAmount: "200",
      notifyUrl: "https://notify/",
      urlOK: "https://ok/",
      urlKO: "https://ko/",
      hostname: "https://host",
      locale: "es",
      userName: "Nombre",
      userEmail: "user@example.com",
    });

    expect(html).toContain("name='Ds_Merchant_Amount'");
    expect(html).toContain("name='Ds_Merchant_MatchingData'");
    expect(html).toContain("name='Ds_Merchant_MerchantSignature'");

    // override test: pasar TemplateNumber personalizado
    const html2 = payment.generateSubscriptionFormAndIframe({
      merchantCode: "TEST",
      merchantSharedkey: "SECRET",
      merchantTemplate: "TMP",
      paymentGatewayUrl: "https://gw/",
      iframeScriptUrl: "https://gw/iframe.js",
      iframeConfigureUrl: "https://gw/config",
      trialAmount: "100",
      subscriptionAmount: "200",
      notifyUrl: "https://notify/",
      urlOK: "https://ok/",
      urlKO: "https://ko/",
      hostname: "https://host",
      locale: "es",
      userName: "Nombre",
      userEmail: "user@example.com",
      templateNumber: "99",
    });
    expect(html2).toContain("name='Ds_Merchant_TemplateNumber' value='99'");
  });
});
