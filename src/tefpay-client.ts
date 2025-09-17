// Clase principal para configuración y gestión general
export class TefpayClient {
  constructor(
    public merchantCode: string,
    public secretKey: string,
    public environment: "production" | "integration" = "integration"
  ) {}
}
