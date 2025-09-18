# `Tefpay Integration`

Integración universal, robusta y minimalista de pagos y suscripciones TEFPAY para React, Express, Fastify, Koa y NestJS.

## Índice

- [`Tefpay Integration`](#tefpay-integration)
  - [Índice](#índice)
  - [Características Destacadas](#características-destacadas)
  - [Quick Start](#quick-start)
    - [1. Instalación del paquete](#1-instalación-del-paquete)
    - [2. Instalación de Peer Dependencies](#2-instalación-de-peer-dependencies)
    - [3. Crear tu endpoint de notificaciones (Backend Obligatorio)](#3-crear-tu-endpoint-de-notificaciones-backend-obligatorio)
    - [4. (Opcional) Integrar Hooks visuales en React](#4-opcional-integrar-hooks-visuales-en-react)
    - [5. Ejecuta los tests para validar tu integración](#5-ejecuta-los-tests-para-validar-tu-integración)
  - [Manejo de Notificaciones (Backend Obligatorio)](#manejo-de-notificaciones-backend-obligatorio)
    - [Next.js (App Router)](#nextjs-app-router)
    - [Express](#express)
    - [Fastify](#fastify)
    - [Koa](#koa)
    - [NestJS](#nestjs)
  - [Adaptadores Multiplataforma](#adaptadores-multiplataforma)
  - [Hooks y Utilidades Frontend (React)](#hooks-y-utilidades-frontend-react)
  - [Cobertura y Robustez de Tests](#cobertura-y-robustez-de-tests)
  - [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)
    - [¿Por qué es obligatorio el uso de un backend para `handleTefpayNotification`?](#por-qué-es-obligatorio-el-uso-de-un-backend-para-handletefpaynotification)
    - [¿Puedo usar el paquete solo en frontend?](#puedo-usar-el-paquete-solo-en-frontend)
    - [¿Qué hago si la firma de la notificación es inválida?](#qué-hago-si-la-firma-de-la-notificación-es-inválida)
    - [¿Cómo depuro errores de integración?](#cómo-depuro-errores-de-integración)
    - [¿Por qué no hay un test de `Next.js` "estándar"?](#por-qué-no-hay-un-test-de-nextjs-estándar)
  - [Solución de Problemas Comunes](#solución-de-problemas-comunes)
  - [Diagrama de Flujo de Integración](#diagrama-de-flujo-de-integración)
  - [Soporte](#soporte)

---

## Características Destacadas

- **Universal:** Compatibilidad con React, Express, Fastify, Koa y NestJS.
- **Minimalista:** Fácil integración con mínima configuración.
- **Robusta y Segura:** Validación automática de firmas, campos y tipos de transacción.
- **Completa:** Manejo de pagos, suscripciones y sus notificaciones asociadas (altas, bajas, cobros, devoluciones, etc.).
- **Herramientas para Frontend:** Hooks React para una experiencia de usuario fluida.
- **Tests End-to-End:** Cobertura exhaustiva para una integración confiable.

---

## Quick Start

### 1\. Instalación del paquete

```bash
pnpm add tefpay-integration
# o
npm install tefpay-integration
# o
yarn add tefpay-integration
```

### 2\. Instalación de Peer Dependencies

El paquete requiere que tengas instaladas las `peerDependencies` de tu framework. Instala las recomendadas según tu stack:

- **React:** `pnpm add react` (para hooks frontend)
- **Express:** `pnpm add express`
- **Fastify:** `pnpm add fastify`
- **Koa:** `pnpm add koa koa-bodyparser`
- **NestJS:** `pnpm add @nestjs/common @nestjs/core`

> **Compatibilidad:**
>
> - React `>= 18.x`
> - Express `>= 4.x`
> - Fastify `>= 4.x`
> - Koa `>= 3.x`
> - NestJS `>= 9.x`

### 3\. Crear tu endpoint de notificaciones (Backend Obligatorio)

Tefpay envía notificaciones automáticas a tu backend tras cada acción. El uso de `handleTefpayNotification` o sus adaptadores específicos es **obligatorio** para procesar correctamente el flujo de suscripciones y pagos. Consulta la sección detallada a continuación para ejemplos específicos.

### 4\. (Opcional) Integrar Hooks visuales en React

```tsx
import { useTefpaySubscriptionAction, TefpayClient } from "tefpay-integration";
// ...ver ejemplo completo en la sección "Hooks y Utilidades Frontend"
```

### 5\. Ejecuta los tests para validar tu integración

```bash
pnpm test -- --coverage
```

---

## Manejo de Notificaciones (Backend Obligatorio)

El paquete ofrece adaptadores específicos para cada framework que simplifican la integración. Todos ellos utilizan internamente `handleTefpayNotification` para procesar el cuerpo de la solicitud, validar la firma y ejecutar tu `callback` personalizado.

> **ROBUSTEZ Y SEGURIDAD:**
>
> - **Validación automática:** El paquete valida el tamaño del body, la presencia de campos obligatorios, la firma y el tipo de transacción soportado en cada notificación.
> - **Endpoint HTTPS:** Expón el endpoint de notificaciones solo por HTTPS.
> - **No procesar:** Nunca proceses notificaciones si la firma es inválida o faltan datos críticos.
> - **Restricción IP:** Limita el acceso al endpoint solo a IPs de Tefpay si es posible, o monitoriza intentos sospechosos.
> - **Logging:** Registra todos los eventos y errores en logs persistentes para auditoría y trazabilidad.
> - **Información sensible:** No devuelvas información sensible en la respuesta del endpoint.
> - **Clave Secreta:** Revisa y actualiza la clave secreta periódicamente y almacénala solo en variables de entorno seguras (`process.env.TEFPAY_SECRET_KEY`).
> - **Validar Eventos:** Valida siempre el `event` y los `data` recibidos antes de ejecutar cualquier acción en tu backend.
> - **Middlewares de Seguridad:** Considera usar middlewares adicionales de validación (rate limiting, body size, CORS estricto) en el endpoint de notificaciones.

---

### Next.js (App Router)

Utiliza `tefpayNextHandler` en un Route Handler.

```typescript
// app/api/tefpay-notify/route.ts
import { tefpayNextHandler } from "tefpay-integration/dist/adapters/next-adapter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const result = await tefpayNextHandler(
      req,
      NextResponse, // Pasa NextResponse para la gestión de respuesta
      process.env.TEFPAY_SECRET_KEY!,
      async (data) => {
        // --- Lógica de procesamiento de notificación ---
        // 'data' contendrá los campos procesados (event, status, email, account, etc.)

        if (
          data.event === "subscription_activated" &&
          data.status === "active"
        ) {
          // Actualiza la suscripción en BD, envía email, etc.
          return { success: true, action: "activate_subscription", ...data };
        }

        if (data.event === "charge_attempt_failed") {
          // Registrar el fallo, enviar alerta, etc.
          return { success: false, action: "charge_failed", ...data };
        }

        if (
          data.event === "subscription_suspended" &&
          data.status === "suspended"
        ) {
          // Suspender la suscripción en BD
          return { success: true, action: "suspend_subscription", ...data };
        }

        // Otros casos...
        return { success: false, action: "unknown", ...data };
      }
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
```

### Express

Utiliza `tefpayExpressMiddleware` como middleware de ruta. Asegúrate de tener `express.json()` o `body-parser` configurado.

```typescript
// app.ts (o archivo de ruta)
import express from "express";
import { tefpayExpressMiddleware } from "tefpay-integration/dist/adapters/express-adapter";

const app = express();
app.use(express.json()); // Necesario para parsear el body JSON

app.post(
  "/api/tefpay-notify",
  tefpayExpressMiddleware(process.env.TEFPAY_SECRET_KEY!, async (data) => {
    // Procesa la notificación en tu backend
    return { status: "ok", ...data };
  })
);

app.listen(3000, () => console.log("Express running on port 3000"));
```

### Fastify

Utiliza `tefpayFastifyHandler` como handler de ruta. Fastify parsea el body JSON por defecto.

```typescript
// app.ts (o archivo de ruta)
import Fastify from "fastify";
import { tefpayFastifyHandler } from "tefpay-integration/dist/adapters/fastify-adapter";

const fastify = Fastify();

fastify.post(
  "/api/tefpay-notify",
  tefpayFastifyHandler(process.env.TEFPAY_SECRET_KEY!, async (data) => {
    // Procesa la notificación en tu backend
    return { status: "ok", ...data };
  })
);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Fastify running on ${address}`);
});
```

### Koa

Utiliza `tefpayKoaMiddleware` como middleware de aplicación. Requiere `koa-bodyparser`.

```typescript
// app.ts (o archivo de ruta)
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { tefpayKoaMiddleware } from "tefpay-integration/dist/adapters/koa-adapter";

const app = new Koa();
app.use(bodyParser()); // Necesario para parsear el body JSON

app.use(
  tefpayKoaMiddleware(process.env.TEFPAY_SECRET_KEY!, async (data) => {
    // Procesa la notificación en tu backend
    return { status: "ok", ...data };
  })
);

app.listen(3000, () => console.log("Koa running on port 3000"));
```

### NestJS

Utiliza `tefpayNestHandler` dentro de un controlador. Asegúrate de que NestJS esté configurado para usar Fastify o Express como motor subyacente (ambos son compatibles).

```typescript
// src/tefpay/tefpay.controller.ts
import { Controller, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express"; // O FastifyRequest, FastifyReply si usas Fastify
import { tefpayNestHandler } from "tefpay-integration/dist/adapters/nest-adapter";

@Controller("tefpay")
export class TefpayController {
  @Post("notify") // Endpoint final: /tefpay/notify
  async handleNotification(@Req() req: Request, @Res() res: Response) {
    await tefpayNestHandler(
      req,
      res,
      process.env.TEFPAY_SECRET_KEY!,
      async (data) => {
        // Procesa la notificación en tu backend
        return { status: "ok", ...data };
      }
    );
  }
}
```

---

## Adaptadores Multiplataforma

Los adaptadores son el puente entre tu framework y la lógica central de `tefpay-integration`.

> Se encuentran en `dist/adapters` tras la compilación.
> **Importa desde:** `tefpay-integration/dist/adapters/<nombre-adapter>`

- `tefpay-integration/dist/adapters/next-adapter`
- `tefpay-integration/dist/adapters/express-adapter`
- `tefpay-integration/dist/adapters/fastify-adapter`
- `tefpay-integration/dist/adapters/koa-adapter`
- `tefpay-integration/dist/adapters/nest-adapter`

---

## Hooks y Utilidades Frontend (React)

Este paquete también incluye herramientas para simplificar la integración frontend en React.

- **`useTefpaySubscriptionAction`**: Hook React para gestionar acciones relacionadas con suscripciones (ej. mostrar un formulario de pago, gestionar redirecciones).
- **`TefpayPayment`**: Clase utilitaria para generar formularios de pago y manejar la interacción con la pasarela de Tefpay.

**Ejemplo básico de `useTefpaySubscriptionAction`:**

```tsx
// components/SubscriptionButton.tsx
import React from "react";
import { useTefpaySubscriptionAction, TefpayClient } from "tefpay-integration";

interface SubscriptionButtonProps {
  userId: string;
  planId: string;
}

const TefpayClientInstance = new TefpayClient({
  merchantCode: process.env.NEXT_PUBLIC_TEFPAY_MERCHANT_CODE!,
  terminal: process.env.NEXT_PUBLIC_TEFPAY_TERMINAL!,
  apiUrl: process.env.NEXT_PUBLIC_TEFPAY_API_URL!,
});

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  userId,
  planId,
}) => {
  const { initiateAction, isLoading, error } =
    useTefpaySubscriptionAction(TefpayClientInstance);

  const handleSubscribe = async () => {
    try {
      // Aquí se simula la obtención de la URL de pago desde tu backend
      // En una aplicación real, tu backend generaría esta URL de Tefpay
      // basándose en userId, planId, y otros datos de la suscripción.
      const response = await fetch("/api/create-tefpay-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId }),
      });
      const { paymentUrl } = await response.json();

      if (paymentUrl) {
        // Redirige al usuario al formulario de pago de Tefpay
        initiateAction(paymentUrl);
      } else {
        throw new Error("No se pudo obtener la URL de pago de Tefpay.");
      }
    } catch (err) {
      console.error("Error al iniciar suscripción:", err);
    }
  };

  return (
    <div>
      <button onClick={handleSubscribe} disabled={isLoading}>
        {isLoading ? "Cargando..." : "Suscribirse Ahora"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>
  );
};

export default SubscriptionButton;
```

---

## Cobertura y Robustez de Tests

El paquete incluye **tests unitarios y de integración end-to-end (e2e)** para todos los adaptadores principales, asegurando la robustez y el correcto funcionamiento en diferentes entornos.

- **Express:** `test/e2e/tefpay-e2e-express.test.ts`
- **Fastify:** `test/e2e/tefpay-e2e-fastify.test.ts`
- **Koa:** `test/e2e/tefpay-e2e-koa.test.ts`
- **NestJS:** `test/e2e/tefpay-e2e-nest.test.ts`
- **Next.js:** (`test/e2e/tefpay-e2e-next.test.ts`) - Requiere Next.js como `devDependency` y un entorno Next real para su ejecución.

Para cada framework, existe un test equivalente que valida el flujo completo, la robustez de la integración y el manejo de errores.

---

## Preguntas Frecuentes (FAQ)

### ¿Por qué es obligatorio el uso de un backend para `handleTefpayNotification`?

Tefpay opera enviando notificaciones asíncronas a un endpoint de tu servidor. Procesar estas notificaciones es esencial para actualizar el estado de las suscripciones y pagos en tu base de datos y gestionar el ciclo de vida del usuario. Sin este procesamiento backend, tu integración no puede funcionar correctamente ni de forma segura.

### ¿Puedo usar el paquete solo en frontend?

No. Aunque se proporcionan hooks y utilidades para React, la parte crítica de la integración con Tefpay (validación de notificaciones y actualización de estados) **debe residir en tu backend** para garantizar seguridad y fiabilidad.

### ¿Qué hago si la firma de la notificación es inválida?

Si el paquete reporta una firma inválida, los pasos a seguir son:

1.  **Verificar `TEFPAY_SECRET_KEY`:** Asegúrate de que la clave secreta configurada en tu `process.env.TEFPAY_SECRET_KEY` sea idéntica a la que tienes en tu panel de Tefpay. Un solo carácter diferente causará un fallo.
2.  **Confirmar Body Parser:** Asegúrate de que tu framework (Express, Fastify, Koa, NestJS) esté parseando correctamente el cuerpo de la solicitud JSON antes de pasarla al adaptador de Tefpay.
3.  **Depuración:** Activa los logs detallados para ver los datos exactos que está recibiendo tu endpoint y cómo se está calculando la firma.

### ¿Cómo depuro errores de integración?

1.  **Logs en tu Backend:** Implementa logging exhaustivo en tu `callback` y alrededor del manejador de notificaciones.
2.  **Documentación Técnica:** Consulta la documentación técnica detallada de Tefpay sobre el formato de las notificaciones.
3.  **Tests Incluidos:** Utiliza los tests `e2e` provistos en el paquete para simular notificaciones y verificar el comportamiento.
4.  **Entorno de Desarrollo:** Realiza pruebas en un entorno de desarrollo donde puedas examinar las solicitudes entrantes y salientes.

### ¿Por qué no hay un test de `Next.js` "estándar"?

Los tests de Next.js requieren la ejecución dentro de un contexto de Next.js real o con `next` instalado como `devDependency`. Debido a la naturaleza del entorno de pruebas, no se incluye un test e2e de Next.js en la ejecución principal, pero se recomienda crearlos y ejecutarlos dentro de un proyecto Next.js.

---

## Solución de Problemas Comunes

- **Error de firma inválida:** Clave secreta incorrecta o cuerpo de la solicitud modificado.
  - **Solución:** Verifica tu `TEFPAY_SECRET_KEY` y asegúrate de que tu `body-parser` (o equivalente) esté configurado correctamente.
- **No llegan notificaciones:** El endpoint no está expuesto correctamente o Tefpay no tiene la URL configurada.
  - **Solución:** Confirma que tu servidor esté escuchando en la URL correcta y que esa URL esté registrada en tu panel de control de Tefpay. Verifica que no haya firewalls bloqueando las solicitudes de Tefpay.
- **Error en adaptadores al importar:** Problemas con la ruta de importación o el proceso de transpilación.
  - **Solución:** Asegúrate de importar desde `tefpay-integration/dist/adapters/<nombre-adapter>` después de que el paquete ha sido compilado.
- **Problemas con `peerDependencies`:** El paquete no encuentra las dependencias necesarias de tu framework.
  - **Solución:** Instala las versiones recomendadas de React, Express, Fastify, Koa y NestJS.
- **Tests de Next.js no ejecutan:** No hay un entorno Next.js disponible.
  - **Solución:** Ejecuta los tests de Next.js solo en proyectos Next.js reales donde `next` esté instalado.

---

## Diagrama de Flujo de Integración

```mermaid
flowchart TD
  A[Frontend: React/Next.js (App)] -->|1. Iniciar Pago/Suscripción| B(Tu Backend: Express/Fastify/Koa/NestJS)
  B -->|2. Generar Solicitud de Pago| C(Servidor TEFPAY)
  C -->|3. Redirección al Formulario de Pago| A
  A -->|4. Usuario Completa Pago| C
  C -->|5. Notificación Automática (Webhook)| B
  B -->|6. Adaptador TEFPAY (handleTefpayNotification)| D{Validación de Firma y Datos}
  D -- "Firma OK" --> E[7. Callback Personalizado: Procesa Evento, Actualiza BD]
  D -- "Firma Inválida" --> F[7. Error: Registra y Responde 400]
  E -->|8. Respuesta HTTP 200| C
  F -->|8. Respuesta HTTP 400| C
  E -->|9. Notificar Frontend (Opcional: Websockets, Refetch)| A
```

---

## Soporte

Si tienes dudas sobre la configuración de tu cuenta Tefpay, el proceso de activación de notificaciones o el flujo transaccional específico de Tefpay, por favor, revisa su documentación oficial y contacta directamente al equipo de soporte de Tefpay.

Para consultas relacionadas con la implementación de `tefpay-integration` en tu código, problemas con los adaptadores, o sugerencias de mejora del paquete, abre un _issue_ en nuestro repositorio de GitHub.

---

# Editor visual inteligente para templates Tefpay

## Descripción

Sistema visual avanzado para editar, personalizar y exportar templates de formularios de pago Tefpay. Permite edición visual, gestión de assets, internacionalización, optimización automática y exportación lista para integración.

## Instalación y activación

El editor está disponible solo en modo desarrollo. Se activa mediante el botón flotante en la interfaz.

## Funcionalidades principales

- Edición visual de layouts, estilos, textos y lógica JS.
- Vista previa en tiempo real y simulación de interacciones.
- Gestión de assets: logo, fondo, iconos, favicon (drag & drop, renombrar, eliminar).
- Internacionalización automática (i18next), validación de traducciones y placeholders.
- Optimización automática de imágenes (compresión/minificación).
- Exportación avanzada: ZIP con HTML, traducciones y assets en varios formatos (PNG, JPG, SVG, ICO).
- Extensible mediante plugins (campos, integraciones, validaciones extra).

## Uso básico

1. Haz clic en el botón flotante para abrir el editor visual.
2. Navega por las pestañas: Layout, Estilos, Textos, Lógica, Vista Previa, Exportar.
3. Edita el formulario, estilos, textos y lógica según tus necesidades.
4. Arrastra y gestiona assets (logo, fondo, iconos, favicon).
5. Valida traducciones y lógica antes de exportar.
6. Exporta el ZIP listo para integración Tefpay.

## Exportación y formatos soportados

- El ZIP incluye:
  - template.html
  - translations.json
  - logo, fondo, iconos y favicon en formatos originales y alternativos (PNG, JPG, SVG, ICO).
- Las imágenes se comprimen y minifican automáticamente.
- Soporte para internacionalización y validación de assets.

## Extensibilidad y roadmap

- El sistema permite añadir plugins para nuevos campos, integraciones o validaciones.
- Próximas mejoras: historial de versiones, previsualización multi-dispositivo, sugerencias inteligentes de UX/accesibilidad.

## Preguntas frecuentes

- ¿El editor está disponible en producción? No, solo en desarrollo.
- ¿Puedo añadir mis propios plugins? Sí, la arquitectura es extensible.
- ¿Qué pasa si falta una traducción? El editor bloquea la exportación y muestra advertencias.

## Documentación técnica y ejemplos

- Consulta `docs/PROPUESTA_EDITOR_TEMPLATE.md` para la propuesta completa y detalles de arquitectura.
- Ejemplos visuales y casos de uso en `docs/README.examples.md`.

---

## API: generateHostedPaymentForm

Genera un formulario HTML listo para enviarse al gateway de Tefpay (página hospedada). El método monta por defecto una serie de campos ocultos `Ds_Merchant_*` con valores lógicos que pueden ser sobrescritos mediante el objeto `params` que se pasa al método.

Campos incluidos por defecto (pueden ser sobrescritos mediante `params`):

- `Ds_Merchant_Amount` — Importe en céntimos (p.ej. "1000").
- `Ds_Merchant_Currency` — Código ISO numérico de moneda (por defecto `978` para EUR).
- `Ds_Merchant_MerchantCode` — Código de comercio.
- `Ds_Merchant_Order` — Identificador de la orden.
- `Ds_Merchant_TransactionType` — Tipo de transacción (por defecto `201`).
- `Ds_Merchant_Url` — URL de callback/notify.
- `Ds_Merchant_UrlOK` — URL de retorno en caso de éxito.
- `Ds_Merchant_UrlKO` — URL de retorno en caso de error.
- `Ds_Merchant_Signature` — Firma generada automáticamente por la librería (puede sobrescribirse).
- `Ds_Merchant_Terminal` — Terminal usado (por defecto `00000001`).
- `Ds_Merchant_AdditionalData` — Campo adicional libre.
- `Ds_Merchant_MatchingData` — Identificador de coincidencia (opcional).
- `Ds_Merchant_TemplateNumber` — Número de plantilla (opcional).
- `Ds_Merchant_MerchantCodeTemplate` — Código de plantilla del comercio (opcional).
- `Ds_Merchant_MerchantData` — Datos adicionales del comercio (opcional).
- `Ds_Merchant_Lang` — Idioma del formulario (por defecto `es`).
- `Ds_Merchant_MerchantSignature` — Firma de merchant (por defecto igual a `Ds_Merchant_Signature`, pero puedes pasar `merchantSignature` en `params`).

Ejemplo de uso:

```ts
import { TefpayClient, TefpayPayment } from "tefpay-integration";

const client = new TefpayClient({
  /* config */
});
const payment = new TefpayPayment(client);

const html = payment.generateHostedPaymentForm({
  amount: "1000",
  merchantCode: "MYCODE",
  order: "ORDER-123",
  callbackUrl: "https://mi-backend/notify",
  urlOK: "https://miweb/success",
  urlKO: "https://miweb/fail",
  secretKey: process.env.TEFPAY_SECRET_KEY!,
  paymentGatewayUrl: "https://gateway.tefpay.example/hosted",
  currency: "978", // opcional, por defecto 978 (EUR)
  locale: "es", // opcional
});

// Renderiza en tu frontend o devuelvelo en un endpoint
res.send(html);
```

Notas:

- Para integraciones en producción se recomienda generar la firma y los campos sensibles en el servidor (backend). Este método facilita el HTML listo para enviar pero espera recibir la `secretKey` para firmar correctamente.
- Si necesitas un HTML de preview sin campos Tefpay, usa las utilidades del editor; este método produce el formulario final listo para POST.

## Fixtures de ejemplo (test/manual)

En `test/manual/` incluimos ejemplos de salida HTML generados por las utilidades de pago (`subscription-output.html` y `hosted-output.html`). Estos fixtures tienen varias utilidades:

- Sirven como ejemplos para integradores que quieran ver exactamente qué se envía al gateway.
- Pueden usarse como fixtures para tests de regresión (comprobación automática de cambios en el formato).
- Ayudan a debugging y a la generación de documentación y ejemplos.

Si tus integraciones requieren comparar el HTML generado con un formato esperado, puedes usar estos archivos como referencia.

## API: generateSubscriptionFormAndIframe

Genera el HTML necesario para crear una suscripción en Tefpay y cargar el iframe correspondiente. El método monta por defecto una serie de campos ocultos `Ds_Merchant_*` orientados a la gestión de suscripciones y opciones de carga inicial (trial) que pueden ser sobrescritos mediante el objeto `options` que se pasa al método.

Comportamiento adicional importante:

- Si `matchingData` no se proporciona, la función generará automáticamente un identificador único basado en la fecha/hora (se normaliza y se rellena hasta 21 caracteres): esto garantiza idempotencia y trazabilidad.
- La firma (`Ds_Merchant_MerchantSignature`) se calcula internamente usando SHA1 sobre: `trialAmount + merchantCode + matchingData + notifyUrl + merchantSharedkey`.
- Se usa `buildHiddenFields` internamente para mezclar defaults y overrides; por tanto cualquier campo `Ds_Merchant_*` puede ser sobrescrito pasando la clave correspondiente en `options`.

Campos incluidos por defecto (pueden ser sobrescritos mediante `options`):

- `Ds_Merchant_TransactionType` — Tipo de transacción para suscripciones (por defecto `6`).
- `Ds_Merchant_Subscription_ProcessingMethod` — Método de procesamiento (por defecto `201`).
- `Ds_Merchant_Subscription_Action` — Acción de suscripción (por defecto `C`).
- `Ds_Merchant_Currency` — Código ISO numérico de moneda (por defecto `978` para EUR).
- `Ds_Merchant_Amount` — Importe de la prueba/primer cargo (p.ej. `trialAmount`).
- `Ds_Merchant_Subscription_ChargeAmount` — Importe de la suscripción periódica.
- `Ds_Merchant_Subscription_RelFirstCharge` — Relación de primer cargo (por defecto `02D`).
- `Ds_Merchant_Subscription_PeriodType` — Tipo de periodo (por defecto `M` = mes).
- `Ds_Merchant_Subscription_PeriodInterval` — Intervalo del periodo (por defecto `1`).
- `Ds_Merchant_Terminal` — Terminal de pago según idioma (por defecto mapeado por locale, p.ej. `00000001` para `es`).
- `Ds_Merchant_TerminalAuth` — Terminal de autenticación (por defecto igual a `Ds_Merchant_Terminal`).
- `Ds_Merchant_Subscription_Iteration` — Número de iteraciones previstas (por defecto `0` para indefinido).
- `Ds_Merchant_Url` — URL de notificación/callback (notifyUrl).
- `Ds_Merchant_UrlOK` — URL de retorno en caso de éxito.
- `Ds_Merchant_UrlKO` — URL de retorno en caso de error.
- `Ds_Merchant_MerchantCode` — Código de comercio.
- `Ds_Merchant_MerchantCodeTemplate` — Código de plantilla del comercio.
- `Ds_Merchant_TemplateNumber` — Número de plantilla (por defecto `07`).
- `Ds_Merchant_AdditionalData` — Campo adicional (por defecto `1`).
- `Ds_Merchant_MatchingData` — Identificador de coincidencia (generado si no existe).
- `Ds_Merchant_MerchantSignature` — Firma calculada con SHA1 (puedes sobrescribirla si necesitas una firma distinta generada externamente).
- `Ds_Merchant_Subscription_Account` — Cuenta de suscripción (por defecto igual a `matchingData`).
- `Ds_Merchant_Subscription_ClientName` — Nombre del cliente.
- `Ds_Merchant_Subscription_ClientEmail` — Email del cliente (se limpia de acentos y espacios automáticamente).
- `Ds_Merchant_Subscription_Description` — Descripción de la suscripción.
- `Ds_Merchant_Description` — Descripción del pago inicial.
- `Ds_Merchant_Subscription_NotifyCostumerByEmail` — Indica si notificar al cliente por correo (por defecto `0`).
- `Ds_Merchant_Lang` — Idioma del formulario (por defecto el `locale` que pases).
- `Ds_Merchant_Subscription_Enable` — Habilita la suscripción (por defecto `1`).

Ejemplo de uso:

```ts
import { TefpayClient, TefpayPayment } from "tefpay-integration";

const client = new TefpayClient({
  /* config */
});
const payment = new TefpayPayment(client);

const html = payment.generateSubscriptionFormAndIframe({
  merchantCode: "MYCODE",
  merchantSharedkey: process.env.TEFPAY_SECRET_KEY!,
  merchantTemplate: "TEMPLATE-1",
  paymentGatewayUrl: "https://gateway.tefpay.example/hosted",
  iframeScriptUrl: "https://gateway.tefpay.example/iframe.js",
  iframeConfigureUrl: "https://gateway.tefpay.example/configure",
  trialAmount: "1000", // importe primer cargo en céntimos
  subscriptionAmount: "5000", // importe recurrente
  notifyUrl: "https://mi-backend/notify",
  urlOK: "https://miweb/success",
  urlKO: "https://miweb/fail",
  hostname: "https://miweb",
  locale: "es",
  userName: "Juan Pérez",
  userEmail: "juan@example.com",
});

// Devuelve HTML listo para renderizar; incluye el formulario con hidden inputs y el script que carga el iframe.
res.send(html);
```

Notas:

- Por seguridad, calcula la `merchantSharedkey` y la firma en tu servidor. `generateSubscriptionFormAndIframe` calcula internamente la firma si le proporcionas `merchantSharedkey`.
- Si necesitas personalizar algún `Ds_Merchant_*` concreto, pásalo en `options` y sobrescribirá el valor por defecto gracias a `buildHiddenFields`.
