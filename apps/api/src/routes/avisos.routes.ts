import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  emitAvisoAtualizado,
  emitAvisoCriado,
  emitAvisoRemovido
} from "../lib/realtime.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import { validate } from "../middlewares/validate.js";
import { avisoCreateSchema } from "../schemas/aviso.schemas.js";
import { idParamsSchema, paginationQuerySchema } from "../schemas/common.schemas.js";
import { logActivity } from "../services/activity.service.js";

export const avisosRouter = Router();
export const adminAvisosRouter = Router();

avisosRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const avisos = await prisma.aviso.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        criadoEm: "desc"
      }
    });

    response.status(200).json(avisos);
  })
);

adminAvisosRouter.use(authenticateAdmin);

adminAvisosRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const avisos = await prisma.aviso.findMany({
      orderBy: {
        criadoEm: "desc"
      }
    });

    response.status(200).json(avisos);
  })
);

adminAvisosRouter.post(
  "/",
  validate({
    body: avisoCreateSchema
  }),
  asyncHandler(async (request, response) => {
    const aviso = await prisma.aviso.create({
      data: request.body
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "CRIAR",
      entidade: "Aviso",
      entidadeId: aviso.id,
      descricao: `Aviso criado: ${aviso.titulo}.`
    });

    emitAvisoCriado(aviso);

    response.status(201).json(aviso);
  })
);

adminAvisosRouter.patch(
  "/:id/toggle",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const avisoAtual = await prisma.aviso.findUniqueOrThrow({
      where: {
        id: request.params.id
      }
    });

    const aviso = await prisma.aviso.update({
      where: {
        id: avisoAtual.id
      },
      data: {
        ativo: !avisoAtual.ativo
      }
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: aviso.ativo ? "ATIVAR" : "DESATIVAR",
      entidade: "Aviso",
      entidadeId: aviso.id,
      descricao: `Aviso ${aviso.ativo ? "ativado" : "desativado"}: ${aviso.titulo}.`
    });

    emitAvisoAtualizado(aviso);

    response.status(200).json(aviso);
  })
);

adminAvisosRouter.delete(
  "/:id",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const aviso = await prisma.aviso.delete({
      where: {
        id: request.params.id
      }
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "EXCLUIR",
      entidade: "Aviso",
      entidadeId: aviso.id,
      descricao: `Aviso excluído: ${aviso.titulo}.`
    });

    emitAvisoRemovido({
      id: aviso.id
    });

    response.status(200).json({
      mensagem: "Aviso excluído com sucesso."
    });
  })
);
