import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { ApiError } from "../lib/api-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof ApiError) {
    response.status(error.codigo).json({
      erro: error.message,
      codigo: error.codigo
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      erro: "Dados inválidos.",
      codigo: 400
    });
    return;
  }

  if (
    error instanceof JsonWebTokenError ||
    error instanceof TokenExpiredError
  ) {
    response.status(401).json({
      erro: "Token inválido ou expirado.",
      codigo: 401
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      erro: "JSON inválido.",
      codigo: 400
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      response.status(404).json({
        erro: "Registro não encontrado.",
        codigo: 404
      });
      return;
    }

    if (error.code === "P2002") {
      response.status(409).json({
        erro: "Registro duplicado.",
        codigo: 409
      });
      return;
    }
  }

  console.error(error);

  response.status(500).json({
    erro: "Erro interno do servidor.",
    codigo: 500
  });
};
