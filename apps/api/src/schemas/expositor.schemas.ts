import { z } from "zod";
import { optionalText, optionalUrl } from "./common.schemas.js";

const expositorBaseSchema = z.object({
  nome: z.string().trim().min(2).max(140),
  estande: z.string().trim().min(1).max(40),
  categoria: z.string().trim().min(2).max(80),
  emoji: z.string().trim().min(1).max(20),
  corPrimaria: z.string().trim().min(3).max(30),
  corFundo: z.string().trim().min(3).max(30),
  descricao: optionalText,
  contato: optionalText,
  site: optionalUrl,
  ativo: z.boolean()
});

export const expositorCreateSchema = expositorBaseSchema.extend({
  ativo: z.boolean().optional().default(true)
});

export const expositorUpdateSchema = expositorBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização."
  });
