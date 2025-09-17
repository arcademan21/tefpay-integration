import { TefpaySubscription } from "../src/tefpay-subscription";
import { TefpayUtils } from "../src/tefpay-utils";

const clientMock = {
  merchantCode: "123456",
  secretKey: "CLAVESECRETA",
  environment: "integration",
} as any;

describe("TefpaySubscription", () => {
  const subscription = new TefpaySubscription(clientMock);

  it("debe calcular la firma de suscripción correctamente", () => {
    const signature = TefpayUtils.signSubscription(
      "SUBS001",
      "C",
      "123456",
      "CLAVESECRETA"
    );
    expect(typeof signature).toBe("string");
    expect(signature.length).toBe(40);
  });
});
