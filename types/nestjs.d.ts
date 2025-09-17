declare module "@nestjs/common" {
  export function Post(path: string): MethodDecorator;
  export function Req(): ParameterDecorator;
  export function Res(): ParameterDecorator;
}
declare module "express" {
  export interface Request {
    body: any;
  }
  export interface Response {
    json(body: any): void;
    status(code: number): Response;
  }
}
