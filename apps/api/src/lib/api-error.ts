export class ApiError extends Error {
  public readonly codigo: number;

  constructor(erro: string, codigo = 500) {
    super(erro);
    this.name = "ApiError";
    this.codigo = codigo;
  }
}
