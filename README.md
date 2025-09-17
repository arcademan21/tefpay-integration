# tefpay-integration

Integración universal y segura de suscripciones y pagos TEFPAY para React y Node.js. Permite gestionar el ciclo completo de suscripciones, pagos y notificaciones automáticas.

---

## Instalación

```bash
pnpm add tefpay-integration
```

---

## Flujo de integración y notificaciones

**IMPORTANTE:** Tefpay envía notificaciones automáticas a tu backend tras cada acción (alta, baja, cobro, devolución, etc.). Por eso, **el uso de `handleTefpayNotification` en tu proyecto principal es obligatorio** para procesar correctamente el flujo de suscripciones y pagos.

Debes exponer una ruta (por ejemplo, `/api/tefpay-notify`) que reciba las notificaciones y utilice este hook para validar, interpretar y actuar según el evento recibido.

El hook:

- Valida la firma y los datos recibidos.
- Enriquecerá el objeto con campos como `event`, `status`, `reason`, `email`, etc.
- Permite que tu backend decida la acción a tomar según el tipo de evento.

**Sin este flujo, tu integración con Tefpay no funcionará correctamente, ya que las acciones (activación, suspensión, cobro, etc.) dependen de las notificaciones recibidas.**

### ¿Puede el paquete procesar las notificaciones internamente?

No, el paquete no puede procesar las notificaciones internamente tras cada transacción, porque:

- Las notificaciones son enviadas por Tefpay directamente a tu backend (no al frontend ni al paquete).
- El paquete no tiene acceso al endpoint público de tu servidor donde llegan las notificaciones.
- Es responsabilidad del proyecto principal exponer la ruta y procesar la notificación usando el hook.

**Por eso, debes importar y usar `handleTefpayNotification` en tu backend, en la ruta que recibirá las notificaciones de Tefpay.**

---

## Ejemplo de integración de notificaciones

```typescript
// pages/api/tefpay-notify.ts (Next.js)
import { handleTefpayNotification } from "tefpay-integration";

export default async function handler(req, res) {
  try {
    const result = await handleTefpayNotification(req.body, {
      secretKey: process.env.TEFPAY_SECRET_KEY!,
      callback: async (data) => {
        // --- CASOS PRINCIPALES DE NOTIFICACIÓN TEFPAY ---
        // La función handleTefpayNotification prepara el objeto 'data' con los siguientes campos:
        // - event: tipo de evento detectado (ej: "subscription_activated", "charge_attempt_failed", "subscription_suspended", "refund_error", etc.)
        // - status: estado del evento (ej: "active", "suspended", "failed", "error", etc.)
        // - email, account, reason, trial, etc. según el caso

        // Suscripción activada por el banco
        if (
          data.event === "subscription_activated" &&
          data.status === "active"
        ) {
          // Actualiza la suscripción en BD, envía email, etc.
          // data.trial === "ended"
          return { success: true, action: "activate_subscription", ...data };
        }

        // Intento de cobro fallido
        if (data.event === "charge_attempt_failed") {
          // Registrar el fallo, enviar alerta, etc.
          // data.reason contiene el motivo
          return { success: false, action: "charge_failed", ...data };
        }

        // Suspensión de suscripción
        if (
          data.event === "subscription_suspended" &&
          data.status === "suspended"
        ) {
          // Suspender la suscripción en BD
          return { success: true, action: "suspend_subscription", ...data };
        }

        // Error en devolución
        if (data.event === "refund_error") {
          // Registrar el error
          return { success: false, action: "refund_error", ...data };
        }

        // Activación por email
        if (data.event === "subscription_activated" && data.email) {
          // Activar suscripción por email
          return {
            success: true,
            action: "activate_subscription_email",
            ...data,
          };
        }

        // Otros casos y acciones
        // ...

        // Si no se reconoce el evento
        return { success: false, action: "unknown", ...data };
      },
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
```

---

## Ejemplo de integración en Express

```javascript
const express = require("express");
const { handleTefpayNotification } = require("tefpay-integration");
const app = express();
app.use(express.json());

app.post("/api/tefpay-notify", async (req, res) => {
  try {
    const result = await handleTefpayNotification(req.body, {
      secretKey: process.env.TEFPAY_SECRET_KEY,
      callback: async (data) => {
        // Procesa la notificación en el backend
        return { status: "ok", ...data };
      },
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

## Ejemplo de integración en Fastify

```javascript
const Fastify = require("fastify");
const { handleTefpayNotification } = require("tefpay-integration");
const fastify = Fastify();

fastify.post("/api/tefpay-notify", async (request, reply) => {
  try {
    const result = await handleTefpayNotification(request.body, {
      secretKey: process.env.TEFPAY_SECRET_KEY,
      callback: async (data) => {
        // Procesa la notificación en el backend
        return { status: "ok", ...data };
      },
    });
    reply.send(result);
  } catch (err) {
    reply.status(400).send({ error: err.message });
  }
});
```

---

## Adaptadores para integración rápida

#### Express

```typescript
import { tefpayExpressMiddleware } from "tefpay-integration/dist/adapters/express-adapter";

app.post(
  "/api/tefpay-notify",
  tefpayExpressMiddleware(process.env.TEFPAY_SECRET_KEY, async (data) => {
    // Procesa la notificación
    return { status: "ok", ...data };
  })
);
```

#### Next.js API Route

```typescript
import { tefpayNextHandler } from "tefpay-integration/dist/adapters/next-adapter";

export default async function handler(req, res) {
  await tefpayNextHandler(
    req,
    res,
    process.env.TEFPAY_SECRET_KEY,
    async (data) => {
      // Procesa la notificación
      return { status: "ok", ...data };
    }
  );
}
```

#### Fastify

```typescript
import { tefpayFastifyHandler } from "tefpay-integration/dist/adapters/fastify-adapter";

fastify.post(
  "/api/tefpay-notify",
  tefpayFastifyHandler(process.env.TEFPAY_SECRET_KEY, async (data) => {
    // Procesa la notificación
    return { status: "ok", ...data };
  })
);
```

#### Koa

```typescript
import { tefpayKoaMiddleware } from "tefpay-integration/dist/adapters/koa-adapter";

app.use(
  tefpayKoaMiddleware(process.env.TEFPAY_SECRET_KEY, async (data) => {
    // Procesa la notificación
    return { status: "ok", ...data };
  })
);
```

#### NestJS

```typescript
import { tefpayNestHandler } from "tefpay-integration/dist/adapters/nest-adapter";

@Post("/api/tefpay-notify")
async notify(@Req() req: Request, @Res() res: Response) {
  await tefpayNestHandler(req, res, process.env.TEFPAY_SECRET_KEY, async (data) => {
    // Procesa la notificación
    return { status: "ok", ...data };
  });
}
```

### Importación de adaptadores tras la compilación

> **Nota:** Los adaptadores ahora se encuentran en `dist/adapters` tras la compilación. Importa desde:
> `tefpay-integration/dist/adapters/<nombre-adapter>`

#### Express

```typescript
import { tefpayExpressMiddleware } from "tefpay-integration/dist/adapters/express-adapter";

app.post(
  "/api/tefpay-notify",
  tefpayExpressMiddleware(process.env.TEFPAY_SECRET_KEY, async (data) => {
    // Procesa la notificación
    return { status: "ok", ...data };
  })
);
```

#### Next.js API Route

```typescript
  );
}
```

import { tefpayNextHandler } from "tefpay-integration/dist/adapters/next-adapter";

export default async function handler(req, res) {
await tefpayNextHandler(
req,
res,
process.env.TEFPAY_SECRET_KEY,
async (data) => {
// Procesa la notificación
return { status: "ok", ...data };
}
);
}

````

#### Fastify

```typescript
);
````

import { tefpayFastifyHandler } from "tefpay-integration/dist/adapters/fastify-adapter";

fastify.post(
"/api/tefpay-notify",
tefpayFastifyHandler(process.env.TEFPAY_SECRET_KEY, async (data) => {
// Procesa la notificación
return { status: "ok", ...data };
})
);

````

#### Koa

```typescript
);
````

import { tefpayKoaMiddleware } from "tefpay-integration/dist/adapters/koa-adapter";

app.use(
tefpayKoaMiddleware(process.env.TEFPAY_SECRET_KEY, async (data) => {
// Procesa la notificación
return { status: "ok", ...data };
})
);

````

#### NestJS

```typescript
  });
}
````

import { tefpayNestHandler } from "tefpay-integration/dist/adapters/nest-adapter";

@Post("/api/tefpay-notify")
async notify(@Req() req: Request, @Res() res: Response) {
await tefpayNestHandler(req, res, process.env.TEFPAY_SECRET_KEY, async (data) => {
// Procesa la notificación
return { status: "ok", ...data };
});
}

````

---

## Otros hooks y utilidades

- `useTefpaySubscriptionAction`: Hook para gestionar acciones de suscripción desde React.
- `TefpayPayment`: Clase para generar formularios y procesar pagos.
- `TefpayUtils`: Utilidades para firma y validación.

---

## Cobertura de tests

Para mejorar la robustez del paquete, se recomienda:

- Crear tests unitarios para cada hook y clase principal (ejemplo: `test/tefpay-notification.test.ts`).
- Simular notificaciones reales y casos de error.
- Probar la validación de firma y los distintos tipos de eventos.
- Usar Jest para la ejecución y cobertura.

**Ejemplo básico de test:**

```typescript
import { handleTefpayNotification } from "../src/tefpay-notification";

describe("handleTefpayNotification", () => {
  it("valida firma y procesa evento", async () => {
    const body = {
      Ds_Merchant_Amount: "1000",
      Ds_Merchant_MerchantCode: "CODE",
      Ds_Merchant_Order: "ORDER",
      Ds_Merchant_TransactionType: "208",
      Ds_Merchant_Signature: "firma-correcta",
      Ds_Bank: "BANK",
    };
    const result = await handleTefpayNotification(body, {
      secretKey: "SECRET",
      validateSignature: false,
      callback: async (data) => data,
    });
    expect(result.event).toBe("subscription_activated");
    expect(result.status).toBe("active");
  });
});
````

---

## Soporte y dudas

Si tienes dudas sobre la integración, notificaciones o el flujo de Tefpay, revisa la documentación oficial y contacta al equipo de soporte de Tefpay para activar las notificaciones en tu cuenta.
