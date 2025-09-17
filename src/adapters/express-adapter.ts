import {
  handleTefpayNotification,
  TefpayNotificationOptions,
} from "../tefpay-notification";
import { Request, Response, NextFunction } from "express";

export function tefpayExpressMiddleware(
  secretKey: string,
  callback: TefpayNotificationOptions["callback"]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handleTefpayNotification(req.body, {
        secretKey,
        callback,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
