import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRateLimiter, publicRateLimiter } from "./middlewares/rate-limit.js";
import { routes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: env.ALLOWED_ORIGIN,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json());

  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use("/api/auth", authRateLimiter);
  app.use("/api", publicRateLimiter, routes);

  app.use((_request, response) => {
    response.status(404).json({
      erro: "Rota não encontrada.",
      codigo: 404
    });
  });

  app.use(errorHandler);

  return app;
}
