# Changelog

## [Unreleased] - 2025-09-18

### Added

- Documentación: sección `generateSubscriptionFormAndIframe` añadida a `README.md` (lista de campos por defecto, comportamiento de `matchingData` y firma SHA1, ejemplo de uso).
- Tests: Añadidos tests unitarios para `generateSubscriptionFormAndIframe` y ajustes al test de `generateHostedPaymentForm` (Jest).
- Helper: `buildHiddenFields` utilizado para normalizar la construcción de campos `Ds_Merchant_*`.
- Manual artifacts: Guardadas salidas HTML de ejemplo en `test/manual/subscription-output.html` y `test/manual/hosted-output.html`.

### Changed

- `generateHostedPaymentForm` y `generateSubscriptionFormAndIframe` armonizados para usar defaults y permitir overrides mediante parámetros.
- Editor: `Ds_Merchant_Lang` incluido en el preview/export del editor.

### Fixed

- Varias correcciones de tests y dependencias para asegurar que la suite de tests pasa localmente.

### Notes

- Se recomienda añadir CI que ejecute `pnpm test` en cada PR para evitar regresiones.
