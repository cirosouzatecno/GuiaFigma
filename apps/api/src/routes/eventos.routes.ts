import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema, paginationQuerySchema } from "../schemas/common.schemas.js";
import { eventoCreateSchema, eventoUpdateSchema } from "../schemas/evento.schemas.js";
import { logActivity } from "../services/activity.service.js";

export const eventosRouter = Router();
export const adminEventosRouter = Router();

eventosRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const eventos = await prisma.evento.findMany({
      where: {
        ativo: true
      },
      orderBy: [
        {
          dia: "asc"
        },
        {
          horario: "asc"
        }
      ]
    });

    response.status(200).json(eventos);
  })
);

eventosRouter.get(
  "/:id",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const evento = await prisma.evento.findFirst({
      where: {
        id: request.params.id,
        ativo: true
      }
    });

    if (!evento) {
      throw new ApiError("Evento não encontrado.", 404);
    }

    response.status(200).json(evento);
  })
);

adminEventosRouter.use(authenticateAdmin);

adminEventosRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const eventos = await prisma.evento.findMany({
      orderBy: [
        {
          dia: "asc"
        },
        {
          horario: "asc"
        }
      ]
    });

    response.status(200).json(eventos);
  })
);

adminEventosRouter.post(
  "/",
  validate({
    body: eventoCreateSchema
  }),
  asyncHandler(async (request, response) => {
    const evento = await prisma.evento.create({
      data: request.body
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "CRIAR",
      entidade: "Evento",
      entidadeId: evento.id,
      descricao: `Evento criado: ${evento.titulo}.`
    });

    response.status(201).json(evento);
  })
);

adminEventosRouter.put(
  "/:id",
  validate({
    params: idParamsSchema,
    body: eventoUpdateSchema
  }),
  asyncHandler(async (request, response) => {
    const evento = await prisma.evento.update({
      where: {
        id: request.params.id
      },
      data: request.body
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "EDITAR",
      entidade: "Evento",
      entidadeId: evento.id,
      descricao: `Evento editado: ${evento.titulo}.`
    });

    response.status(200).json(evento);
  })
);

adminEventosRouter.delete(
  "/:id",
  validate({
    params: idParamsSchema
  }),
  asyncHandler(async (request, response) => {
    const evento = await prisma.evento.delete({
      where: {
        id: request.params.id
      }
    });

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "EXCLUIR",
      entidade: "Evento",
      entidadeId: evento.id,
      descricao: `Evento excluído: ${evento.titulo}.`
    });

    response.status(200).json({
      mensagem: "Evento excluído com sucesso."
    });
  })
);
