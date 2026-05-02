import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { avisosRouter, adminAvisosRouter } from "./avisos.routes.js";
import { buscaRouter } from "./busca.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { eventosRouter, adminEventosRouter } from "./eventos.routes.js";
import {
  expositoresRouter,
  adminExpositoresRouter
} from "./expositores.routes.js";
import { healthRouter } from "./health.routes.js";
import {
  adminInformacoesRouter,
  informacoesRouter
} from "./informacoes.routes.js";

export const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/eventos", eventosRouter);
routes.use("/expositores", expositoresRouter);
routes.use("/avisos", avisosRouter);
routes.use("/informacoes", informacoesRouter);
routes.use("/busca", buscaRouter);
routes.use("/admin/eventos", adminEventosRouter);
routes.use("/admin/expositores", adminExpositoresRouter);
routes.use("/admin/avisos", adminAvisosRouter);
routes.use("/admin/informacoes", adminInformacoesRouter);
routes.use("/admin/dashboard", dashboardRouter);
