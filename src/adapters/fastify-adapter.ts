import {
  handleTefpayNotification,
  TefpayNotificationOptions,
} from "../tefpay-notification";
import { FastifyRequest, FastifyReply } from "fastify";

export function tefpayFastifyHandler(
  secretKey: string,
  callback: TefpayNotificationOptions["callback"]
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await handleTefpayNotification(request.body, {
        secretKey,
        callback,
      });
      reply.send(result);
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  };
}
