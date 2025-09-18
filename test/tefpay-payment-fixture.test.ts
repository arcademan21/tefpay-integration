import { readFileSync } from "fs";
import { TefpayPayment } from "../src/tefpay-payment";

function parseHiddenInputs(html: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = /<input[^>]*type=['"]hidden['"][^>]*>/gi;
  const inputs = html.match(re) || [];
  for (const input of inputs) {
    const nameMatch = input.match(/name=['"]([^'"]+)['"]/i);
    const valueMatch = input.match(/value=['"]([^'"]*)['"]/i);
    if (nameMatch) {
      map[nameMatch[1]] = valueMatch ? valueMatch[1] : "";
    }
  }
  return map;
}

function filterDynamic(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const skip = new Set([
    "Ds_Merchant_MatchingData",
    "Ds_Merchant_MerchantSignature",
    "Ds_Merchant_Signature",
    "Ds_Merchant_MerchantSignature",
    "Ds_Merchant_Subscription_Account",
  ]);
  for (const k of Object.keys(map)) {
    if (!skip.has(k)) out[k] = map[k];
  }
  return out;
}

describe("Fixture comparison", () => {
  it("subscription fixture fields match generated output (ignoring dynamic fields)", () => {
    const fixture = readFileSync(
      __dirname + "/manual/subscription-output.html",
      "utf8"
    );
    const payment = new TefpayPayment({} as any);
    const generated = payment.generateSubscriptionFormAndIframe({
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

    const fFull = parseHiddenInputs(fixture);
    const gFull = parseHiddenInputs(generated);

    // Validaciones de formato para campos dinámicos
    const matchingRegex = /^[A-Z0-9\-]{5,40}$/i; // permite alfanum y guiones, longitud razonable
    const sha1Regex = /^[a-f0-9]{40}$/i;

    // Suscripción: matchingData y subscription account deben existir y coincidir
    expect(gFull).toHaveProperty("Ds_Merchant_MatchingData");
    expect(gFull).toHaveProperty("Ds_Merchant_Subscription_Account");
    expect(gFull["Ds_Merchant_MatchingData"]).toEqual(
      gFull["Ds_Merchant_Subscription_Account"]
    );
    expect(gFull["Ds_Merchant_MatchingData"]).toMatch(matchingRegex);

    // MerchantSignature debe ser SHA1
    expect(gFull).toHaveProperty("Ds_Merchant_MerchantSignature");
    expect(gFull["Ds_Merchant_MerchantSignature"]).toMatch(sha1Regex);

    // Comparar campos estables
    const fMap = filterDynamic(fFull);
    const gMap = filterDynamic(gFull);
    expect(gMap).toEqual(fMap);
  });

  it("hosted fixture fields match generated output (ignoring dynamic fields)", () => {
    const fixture = readFileSync(
      __dirname + "/manual/hosted-output.html",
      "utf8"
    );
    const payment = new TefpayPayment({} as any);
    const generated = payment.generateHostedPaymentForm({
      amount: "1000",
      merchantCode: "TEST123",
      order: "ORDER-123",
      matchingData: "MATCHING-TEST-HOSTED-0001",
      callbackUrl: "https://mi-backend/notify",
      urlOK: "https://miweb/success",
      urlKO: "https://miweb/fail",
      secretKey: "SECRET",
      paymentGatewayUrl: "https://gateway.tefpay.example/hosted",
    });

    const fFull = parseHiddenInputs(fixture);
    const gFull = parseHiddenInputs(generated);

    const sha1Regex = /^[a-f0-9]{40}$/i;
    const matchingRegex = /^[A-Z0-9\-]{5,40}$/i;

    // Hosted: signature fields deben existir y ser SHA1
    expect(gFull).toHaveProperty("Ds_Merchant_Signature");
    expect(gFull["Ds_Merchant_Signature"]).toMatch(sha1Regex);
    expect(gFull).toHaveProperty("Ds_Merchant_MerchantSignature");
    expect(gFull["Ds_Merchant_MerchantSignature"]).toMatch(sha1Regex);

    // MatchingData formato
    expect(gFull).toHaveProperty("Ds_Merchant_MatchingData");
    expect(gFull["Ds_Merchant_MatchingData"]).toMatch(matchingRegex);

    // Comparar campos estables
    const fMap = filterDynamic(fFull);
    const gMap = filterDynamic(gFull);
    expect(gMap).toEqual(fMap);
  });
});
