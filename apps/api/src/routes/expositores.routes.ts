import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema, paginationQuerySchema } from "../schemas/common.schemas.js";
import {
  expositorCreateSchema,
  expositorUpdateSchema
} from "../schemas/expositor.schemas.js";
import { logActivity } from "../services/activity.service.js";

export const expositoresRouter = Router();
export const adminExpositoresRouter = Router();

expositoresRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const expositores = await prisma.expositor.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        nome: "asc"
      }
    });

    response.status(200).json(expositores);
  })
);

expositoresRouter.get(
  "/categorias",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const categorias = await prisma.expositor.findMany({
      where: {
        ativo: true
      },
      distinct: ["categoria"],
      select: {
        categoria: true
      },
      orderBy: {
        categoria: "asc"
      }
    });

    response.status(200).json(categorias.map((item) => item.categoria));
  })
);

expositoresRouter.get(
  "/:id",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const expositor = await prisma.expositor.findFirst({
      where: {
        id: request.params.id,
        ativo: true
      }
    });

    if (!expositor) {
      throw new ApiError("Expositor não encontrado.", 404);
    }

    response.status(200).json(expositor);
  })
);

adminExpositoresRouter.use(authenticateAdmin);

adminExpositoresRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const expositores = await prisma.expositor.findMany({
      orderBy: {
        nome: "asc"
      }
    });

    response.status(200).json(expositores);
  })
);

adminExpositoresRouter.post(
  "/",
  validate({
    body: expositorCreateSchema
  }),
  asyncHandler(async (request, response) => {
    const expositor = await prisma.expositor.create({
      data: request.body
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "CRIAR",
      entidade: "Expositor",
      entidadeId: expositor.id,
      descricao: `Expositor criado: ${expositor.nome}.`
    });

    response.status(201).json(expositor);
  })
);

adminExpositoresRouter.put(
  "/:id",
  validate({
    params: idParamsSchema,
    body: expositorUpdateSchema
  }),
  asyncHandler(async (request, response) => {
    const expositor = await prisma.expositor.update({
      where: {
        id: request.params.id
      },
      data: request.body
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "EDITAR",
      entidade: "Expositor",
      entidadeId: expositor.id,
      descricao: `Expositor editado: ${expositor.nome}.`
    });

    response.status(200).json(expositor);
  })
);

adminExpositoresRouter.delete(
  "/:id",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const expositor = await prisma.expositor.delete({
      where: {
        id: request.params.id
      }
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "EXCLUIR",
      entidade: "Expositor",
      entidadeId: expositor.id,
      descricao: `Expositor excluído: ${expositor.nome}.`
    });

    response.status(200).json({
      mensagem: "Expositor excluído com sucesso."
    });
  })
);
