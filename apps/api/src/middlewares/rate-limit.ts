import rateLimit from "express-rate-limit";

export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas requisições. Tente novamente em alguns minutos.",
    codigo: 429
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "Muitas tentativas de autenticação. Tente novamente em alguns minutos.",
    codigo: 429
  }
});
