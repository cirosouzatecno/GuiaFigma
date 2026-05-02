import crypto from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  usuario: string;
  nome: string;
};

export type RefreshTokenPayload = JwtPayload & {
  sub: string;
  jti: string;
};

export function signAccessToken(payload: {
  adminId: string;
  usuario: string;
  nome: string;
}) {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(
    {
      usuario: payload.usuario,
      nome: payload.nome
    },
    env.JWT_ACCESS_SECRET,
    {
      ...options,
      subject: payload.adminId
    }
  );
}

export function signRefreshToken(payload: { adminId: string; sessionId: string }) {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    jwtid: payload.sessionId,
    subject: payload.adminId
  };

  return jwt.sign({}, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseDurationToMs(duration: string) {
  const match = duration.trim().match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}
