import { TefpayWebhookHandler } from "../src/tefpay-webhook";
import { TefpayUtils } from "../src/tefpay-utils";

const clientMock = {
  merchantCode: "123456",
  secretKey: "CLAVESECRETA",
  environment: "integration",
} as any;

describe("TefpayWebhookHandler", () => {
  const webhook = new TefpayWebhookHandler(clientMock);

  it("debe validar la firma del callback correctamente", () => {
    const callbackData = {
      Ds_Amount: "1000",
      Ds_Merchant_MatchingData: "MATCH",
      Ds_AuthorisationCode: "AUTH",
      Ds_Merchant_TransactionType: "201",
      Ds_Date: "20250917",
      Ds_Signature: TefpayUtils.signCallbackResponse(
        "1000",
        "MATCH",
        "AUTH",
        "201",
        "20250917",
        "CLAVESECRETA"
      ),
    };
    expect(webhook.verifyCallbackSignature(callbackData, "CLAVESECRETA")).toBe(
      true
    );
  });

  it("debe detectar firma inválida en el callback", () => {
    const callbackData = {
      Ds_Amount: "1000",
      Ds_Merchant_MatchingData: "MATCH",
      Ds_AuthorisationCode: "AUTH",
      Ds_Merchant_TransactionType: "201",
      Ds_Date: "20250917",
      Ds_Signature: "firma_invalida",
    };
    expect(webhook.verifyCallbackSignature(callbackData, "CLAVESECRETA")).toBe(
      false
    );
  });
});
