import {
  handleTefpayNotification,
  TefpayNotificationOptions,
} from "../tefpay-notification";
import { NextRequest, NextResponse } from "next/server";

export async function tefpayNextHandler(
  req: NextRequest,
  secretKey: string,
  callback: TefpayNotificationOptions["callback"]
) {
  const body = await req.json();
  try {
    const result = await handleTefpayNotification(body, {
      secretKey,
      callback,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
