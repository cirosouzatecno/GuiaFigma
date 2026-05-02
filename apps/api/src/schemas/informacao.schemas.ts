import { z } from "zod";

const informacaoItemSchema = z.object({
  chave: z.string().trim().min(1).max(100),
  valor: z.string().trim().min(1).max(5000)
});

export const informacoesUpdateSchema = z.object({
  informacoes: z
    .union([
      z.record(
        z.string().trim().min(1).max(100),
        z.string().trim().min(1).max(5000)
      ),
      z.array(informacaoItemSchema)
    ])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      return Object.entries(value).map(([chave, valor]) => ({
        chave,
        valor
      }));
    })
    .refine((value) => value.length > 0, {
      message: "Informe ao menos uma informação."
    })
});
