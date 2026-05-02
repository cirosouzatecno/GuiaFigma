import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import { validate } from "../middlewares/validate.js";
import { paginationQuerySchema } from "../schemas/common.schemas.js";
import { informacoesUpdateSchema } from "../schemas/informacao.schemas.js";
import { logActivity } from "../services/activity.service.js";

export const informacoesRouter = Router();
export const adminInformacoesRouter = Router();

informacoesRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const informacoes = await prisma.infoGeral.findMany({
      orderBy: {
        chave: "asc"
      }
    });

    response.status(200).json(
      informacoes.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[item.chave] = item.valor;
        return accumulator;
      }, {})
    );
  })
);

adminInformacoesRouter.use(authenticateAdmin);

adminInformacoesRouter.put(
  "/",
  validate({
    body: informacoesUpdateSchema
  }),
  asyncHandler(async (request, response) => {
    const { informacoes } = request.body;

    const salvas = await prisma.$transaction(
      informacoes.map((item: { chave: string; valor: string }) =>
        prisma.infoGeral.upsert({
          where: {
            chave: item.chave
          },
          update: {
            valor: item.valor
          },
          create: {
            chave: item.chave,
            valor: item.valor
          }
        })
      )
    );

    await logActivity({
      adminUserId: request.admin?.id,
      acao: "SALVAR",
      entidade: "InfoGeral",
      descricao: `${salvas.length} informação(ões) geral(is) salva(s).`
    });

    response.status(200).json(
      salvas.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[item.chave] = item.valor;
        return accumulator;
      }, {})
    );
  })
);
