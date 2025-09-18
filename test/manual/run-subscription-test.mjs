import { TefpayClient, TefpayPayment } from "../../dist/index.mjs";

(async () => {
  try {
    const client = new TefpayClient({
      merchantCode: "TEST123",
      terminal: "00000001",
      apiUrl: "https://example.tefpay.local",
    });

    const payment = new TefpayPayment(client);

    const html = payment.generateSubscriptionFormAndIframe({
      merchantCode: "TEST123",
      merchantSharedkey: "SECRETKEY123",
      merchantTemplate: "TEMPLATE-1",
      paymentGatewayUrl: "https://gateway.tefpay.example/hosted",
      iframeScriptUrl: "https://gateway.tefpay.example/iframe.js",
      iframeConfigureUrl: "https://gateway.tefpay.example/configure",
      trialAmount: "1000",
      subscriptionAmount: "5000",
      notifyUrl: "https://my-backend/notify",
      urlOK: "https://my-site/success",
      urlKO: "https://my-site/fail",
      hostname: "https://my-site",
      locale: "es",
      userName: "Juan Pérez",
      userEmail: "juan@example.com",
    });

    console.log("=== HTML OUTPUT START ===");
    console.log(html);
    console.log("=== HTML OUTPUT END ===");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
})();
