import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { paginationQuerySchema } from "../schemas/common.schemas.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  validate({
    query: paginationQuerySchema
  }),
  (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "guia-expo-api"
    });
  }
);
