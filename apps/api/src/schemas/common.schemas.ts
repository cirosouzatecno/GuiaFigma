import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().min(1)
});

export const buscaQuerySchema = z.object({
  q: z.string().trim().min(2).max(80)
});

export const paginationQuerySchema = z.object({}).strict();

export const optionalText = z
  .string()
  .trim()
  .min(1)
  .optional()
  .nullable()
  .transform((value) => value ?? undefined);

export const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .nullable()
  .transform((value) => value ?? undefined);
