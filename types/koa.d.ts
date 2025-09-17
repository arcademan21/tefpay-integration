declare module "koa" {
  export interface Context {
    request: { body: any };
    body: any;
    status: number;
    // ...otros métodos y propiedades relevantes
  }
  export type Next = () => void;
}
