import {
  handleTefpayNotification,
  TefpayNotificationOptions,
} from "../tefpay-notification";
import { Context, Next } from "koa";

export function tefpayKoaMiddleware(
  secretKey: string,
  callback: TefpayNotificationOptions["callback"]
) {
  return async (ctx: Context, next: Next) => {
    try {
      const result = await handleTefpayNotification(ctx.request.body, {
        secretKey,
        callback,
      });
      ctx.body = result;
    } catch (err: any) {
      ctx.status = 400;
      ctx.body = { error: err.message };
    }
    await next();
  };
}
