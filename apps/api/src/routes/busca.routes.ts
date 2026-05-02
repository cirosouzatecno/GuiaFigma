import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { validate } from "../middlewares/validate.js";
import { buscaQuerySchema } from "../schemas/common.schemas.js";

export const buscaRouter = Router();

buscaRouter.get(
  "/",
  validate({
    query: buscaQuerySchema
  }),
  asyncHandler(async (request, response) => {
    const termo = String(request.query.q);

    const [eventos, expositores, informacoes] = await Promise.all([
      prisma.evento.findMany({
        where: {
          ativo: true,
          OR: [
            {
              titulo: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              subtitulo: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              local: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              categoria: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              descricao: {
                contains: termo,
                mode: "insensitive"
              }
            }
          ]
        },
        orderBy: {
          dia: "asc"
        },
        take: 10
      }),
      prisma.expositor.findMany({
        where: {
          ativo: true,
          OR: [
            {
              nome: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              estande: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              categoria: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              descricao: {
                contains: termo,
                mode: "insensitive"
              }
            }
          ]
        },
        orderBy: {
          nome: "asc"
        },
        take: 10
      }),
      prisma.infoGeral.findMany({
        where: {
          OR: [
            {
              chave: {
                contains: termo,
                mode: "insensitive"
              }
            },
            {
              valor: {
                contains: termo,
                mode: "insensitive"
              }
            }
          ]
        },
        orderBy: {
          chave: "asc"
        },
        take: 10
      })
    ]);

    response.status(200).json({
      termo,
      resultados: {
        eventos,
        expositores,
        informacoes
      }
    });
  })
);
