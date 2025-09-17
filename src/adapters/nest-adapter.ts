import {
  handleTefpayNotification,
  TefpayNotificationOptions,
} from "../tefpay-notification";
import { Request, Response } from "express";

export async function tefpayNestHandler(
  req: Request,
  res: Response,
  secretKey: string,
  callback: TefpayNotificationOptions["callback"]
) {
  try {
    const result = await handleTefpayNotification(req.body, {
      secretKey,
      callback,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
