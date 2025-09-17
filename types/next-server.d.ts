declare module "next/server" {
  export class NextRequest {
    json(): Promise<any>;
    // ...otros métodos y propiedades relevantes
  }
  export class NextResponse {
    static json(body: any, init?: { status?: number }): NextResponse;
    // ...otros métodos y propiedades relevantes
  }
}
