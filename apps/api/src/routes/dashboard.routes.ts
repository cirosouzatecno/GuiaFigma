import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";
import { validate } from "../middlewares/validate.js";
import { paginationQuerySchema } from "../schemas/common.schemas.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticateAdmin);

dashboardRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  asyncHandler(async (_request, response) => {
    const [
      eventosTotal,
      eventosAtivos,
      expositoresTotal,
      expositoresAtivos,
      avisosTotal,
      avisosAtivos,
      informacoesTotal,
      administradoresTotal,
      sessoesAtivas,
      ultimasAtividades
    ] = await Promise.all([
      prisma.evento.count(),
      prisma.evento.count({
        where: {
          ativo: true
        }
      }),
      prisma.expositor.count(),
      prisma.expositor.count({
        where: {
          ativo: true
        }
      }),
      prisma.aviso.count(),
      prisma.aviso.count({
        where: {
          ativo: true
        }
      }),
      prisma.infoGeral.count(),
      prisma.adminUser.count(),
      prisma.adminSession.count({
        where: {
          revokedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      prisma.atividadeAdmin.findMany({
        take: 5,
        orderBy: {
          criadoEm: "desc"
        },
        include: {
          adminUser: {
            select: {
              id: true,
              usuario: true,
              nome: true
            }
          }
        }
      })
    ]);

    response.status(200).json({
      contadores: {
        eventosTotal,
        eventosAtivos,
        eventosInativos: eventosTotal - eventosAtivos,
        expositoresTotal,
        expositoresAtivos,
        expositoresInativos: expositoresTotal - expositoresAtivos,
        avisosTotal,
        avisosAtivos,
        avisosInativos: avisosTotal - avisosAtivos,
        informacoesTotal,
        administradoresTotal,
        sessoesAtivas
      },
      ultimasAtividades
    });
  })
);
