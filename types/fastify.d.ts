declare module "fastify" {
  export interface FastifyRequest {
    body: any;
    // ...otros métodos y propiedades relevantes
  }
  export interface FastifyReply {
    send(body: any): void;
    status(code: number): FastifyReply;
    // ...otros métodos y propiedades relevantes
  }
}
