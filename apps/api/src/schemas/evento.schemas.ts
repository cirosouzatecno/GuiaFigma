import { z } from "zod";
import { optionalText } from "./common.schemas.js";

const eventoBaseSchema = z.object({
  titulo: z.string().trim().min(2).max(140),
  subtitulo: optionalText,
  horario: z.string().trim().min(2).max(30),
  local: z.string().trim().min(2).max(140),
  dia: z.coerce.date(),
  categoria: z.string().trim().min(2).max(80),
  iconKey: z.string().trim().min(1).max(60),
  cor: z.string().trim().min(3).max(30),
  descricao: optionalText,
  ativo: z.boolean()
});

export const eventoCreateSchema = eventoBaseSchema.extend({
  ativo: z.boolean().optional().default(true)
});

export const eventoUpdateSchema = eventoBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização."
  });
