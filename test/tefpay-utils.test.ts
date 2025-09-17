import { TefpayUtils } from "../src/tefpay-utils";

describe("TefpayUtils", () => {
  it("debe calcular el hash SHA-1 correctamente", () => {
    expect(TefpayUtils.sha1("test")).toBe(
      "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"
    );
  });

  it("firma de petición de pago (cliente presente)", () => {
    const result = TefpayUtils.signPaymentRequest(
      "1000",
      "123456",
      "ORD001",
      "https://callback.url",
      "CLAVE"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBe(40);
  });

  it("firma de respuesta de callback", () => {
    const result = TefpayUtils.signCallbackResponse(
      "1000",
      "MATCH",
      "AUTH",
      "201",
      "20250917",
      "CLAVE"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBe(40);
  });

  it("firma para suscripciones", () => {
    const result = TefpayUtils.signSubscription(
      "SUBS001",
      "C",
      "123456",
      "CLAVE"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBe(40);
  });
});
