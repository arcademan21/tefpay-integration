declare module "express" {
  export interface Request {
    body: any;
    // ...otros métodos y propiedades relevantes
  }
  export interface Response {
    json(body: any): void;
    status(code: number): Response;
    // ...otros métodos y propiedades relevantes
  }
  export type NextFunction = () => void;
}
