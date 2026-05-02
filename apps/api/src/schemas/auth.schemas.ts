import { z } from "zod";

export const loginSchema = z.object({
  usuario: z.string().trim().min(3).max(80),
  senha: z.string().min(6).max(120)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20)
});
