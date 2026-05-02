import { prisma } from "../lib/prisma.js";

type LogActivityInput = {
  adminUserId?: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  descricao: string;
};

export async function logActivity(input: LogActivityInput) {
  await prisma.atividadeAdmin.create({
    data: {
      adminUserId: input.adminUserId,
      acao: input.acao,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      descricao: input.descricao
    }
  });
}
