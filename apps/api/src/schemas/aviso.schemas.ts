import { AvisoTipo } from "@prisma/client";
import { z } from "zod";

export const avisoCreateSchema = z.object({
  tipo: z.nativeEnum(AvisoTipo),
  titulo: z.string().trim().min(2).max(140),
  mensagem: z.string().trim().min(2).max(1000),
  tempo: z.string().trim().min(2).max(60),
  ativo: z.boolean().optional().default(true)
});
