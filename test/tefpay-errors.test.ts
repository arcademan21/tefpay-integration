import {
  TefpayError,
  TefpayErrorMessages,
  getTefpayErrorMessage,
  tefpayErrorFromCode,
} from "../src/tefpay-errors";

describe("TefpayError", () => {
  it("debe crear una instancia de error con código y mensaje", () => {
    const error = new TefpayError("1", "Transacción denegada");
    expect(error.code).toBe("1");
    expect(error.message).toBe("Transacción denegada");
    expect(error.name).toBe("TefpayError");
  });

  it("debe traducir el código de error a mensaje", () => {
    expect(getTefpayErrorMessage("0")).toBe("Transacción aprobada");
    expect(getTefpayErrorMessage("1")).toBe("Transacción denegada");
    expect(getTefpayErrorMessage("999")).toBe("Error desconocido");
  });

  it("debe crear error desde código", () => {
    const error = tefpayErrorFromCode("1");
    expect(error).toBeInstanceOf(TefpayError);
    expect(error.message).toBe("Transacción denegada");
  });
});
