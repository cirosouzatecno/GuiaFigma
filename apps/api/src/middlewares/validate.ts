import type { NextFunction, Request, Response } from "express";
import { type ZodTypeAny, z } from "zod";
import { ApiError } from "../lib/api-error.js";

type RequestSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const emptySchema = z.object({}).strict();

export function validate(schema: RequestSchema) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const parsed = z
      .object({
        body: schema.body ?? emptySchema,
        params: schema.params ?? emptySchema,
        query: schema.query ?? emptySchema
      })
      .safeParse({
        body: request.body ?? {},
        params: request.params ?? {},
        query: request.query ?? {}
      });

    if (!parsed.success) {
      next(new ApiError("Dados inválidos.", 400));
      return;
    }

    request.body = parsed.data.body;
    request.params = parsed.data.params;
    request.query = parsed.data.query;

    next();
  };
}
