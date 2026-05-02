import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/token.js";

export async function authenticateAdmin(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError("Token de acesso não informado.", 401);
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = verifyAccessToken(token);

    if (!payload.sub) {
      throw new ApiError("Token de acesso inválido.", 401);
    }

    const admin = await prisma.adminUser.findUnique({
      where: {
        id: payload.sub
      },
      select: {
        id: true,
        usuario: true,
        nome: true
      }
    });

    if (!admin) {
      throw new ApiError("Administrador não encontrado.", 401);
    }

    request.admin = admin;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError("Token de acesso inválido ou expirado.", 401));
  }
}
