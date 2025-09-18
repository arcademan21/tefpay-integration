import i18next from "i18next";

const resources = {
  es: {
    translation: {
      payButton: "Pagar",
      cardLabel: "Número de tarjeta",
      msg48: "Tarjeta inválida",
      msg46: "",
      msg47: "",
      msg19: "Fecha de expiración",
      msg50: "CVV inválido",
      payTitle: "Pago seguro",
      paySuccessText: "Pago realizado con éxito",
      payFailText: "Pago rechazado",
      payError: "Error inesperado",
      // ...otros textos
    },
  },
  en: {
    translation: {
      payButton: "Pay",
      cardLabel: "Card number",
      msg48: "Invalid card",
      msg46: "",
      msg47: "",
      msg19: "Expiration date",
      msg50: "Invalid CVV",
      payTitle: "Secure payment",
      paySuccessText: "Payment successful",
      payFailText: "Payment declined",
      payError: "Unexpected error",
      // ...other texts
    },
  },
};

i18next.init({
  lng: "es",
  fallbackLng: "en",
  resources,
});

export default i18next;
