import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import {
  hashToken,
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../lib/token.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, refreshTokenSchema } from "../schemas/auth.schemas.js";
import { logActivity } from "../services/activity.service.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  validate({
    body: loginSchema
  }),
  asyncHandler(async (request, response) => {
    const { usuario, senha } = request.body;

    const admin = await prisma.adminUser.findUnique({
      where: {
        usuario
      }
    });

    if (!admin) {
      throw new ApiError("Usuário ou senha inválidos.", 401);
    }

    const senhaValida = await bcrypt.compare(senha, admin.senhaHash);

    if (!senhaValida) {
      throw new ApiError("Usuário ou senha inválidos.", 401);
    }

    const sessionId = crypto.randomUUID();
    const token = signAccessToken({
      adminId: admin.id,
      usuario: admin.usuario,
      nome: admin.nome
    });
    const refreshToken = signRefreshToken({
      adminId: admin.id,
      sessionId
    });

    await prisma.adminSession.create({
      data: {
        id: sessionId,
        adminUserId: admin.id,
        refreshHash: hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)
        )
      }
    });

    await logActivity({
      adminUserId: admin.id,
      acao: "LOGIN",
      entidade: "AdminSession",
      entidadeId: sessionId,
      descricao: `${admin.nome} iniciou uma sessão administrativa.`
    });

    response.status(200).json({
      token,
      accessToken: token,
      refreshToken,
      admin: {
        id: admin.id,
        usuario: admin.usuario,
        nome: admin.nome
      }
    });
  })
);

authRouter.post(
  "/refresh",
  validate({
    body: refreshTokenSchema
  }),
  asyncHandler(async (request, response) => {
    const { refreshToken } = request.body;
    const payload = verifyRefreshToken(refreshToken);

    if (!payload.sub || !payload.jti) {
      throw new ApiError("Refresh token inválido.", 401);
    }

    const session = await prisma.adminSession.findUnique({
      where: {
        id: payload.jti
      },
      include: {
        adminUser: true
      }
    });

    if (
      !session ||
      session.adminUserId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.refreshHash !== hashToken(refreshToken)
    ) {
      throw new ApiError("Refresh token inválido ou expirado.", 401);
    }

    const token = signAccessToken({
      adminId: session.adminUser.id,
      usuario: session.adminUser.usuario,
      nome: session.adminUser.nome
    });

    response.status(200).json({
      token,
      accessToken: token
    });
  })
);

authRouter.post(
  "/logout",
  validate({
    body: refreshTokenSchema
  }),
  asyncHandler(async (request, response) => {
    const { refreshToken } = request.body;
    const payload = verifyRefreshToken(refreshToken);

    if (!payload.sub || !payload.jti) {
      throw new ApiError("Refresh token inválido.", 401);
    }

    const session = await prisma.adminSession.findUnique({
      where: {
        id: payload.jti
      },
      include: {
        adminUser: true
      }
    });

    if (
      !session ||
      session.adminUserId !== payload.sub ||
      session.refreshHash !== hashToken(refreshToken)
    ) {
      throw new ApiError("Refresh token inválido.", 401);
    }

    if (!session.revokedAt) {
      await prisma.adminSession.update({
        where: {
          id: session.id
        },
        data: {
          revokedAt: new Date()
        }
      });

      await logActivity({
        adminUserId: session.adminUserId,
        acao: "LOGOUT",
        entidade: "AdminSession",
        entidadeId: session.id,
        descricao: `${session.adminUser.nome} encerrou uma sessão administrativa.`
      });
    }

    response.status(200).json({
      mensagem: "Sessão encerrada com sucesso."
    });
  })
);
