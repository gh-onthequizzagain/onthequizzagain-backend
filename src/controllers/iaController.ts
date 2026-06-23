import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error";
import { isNumber } from "../helpers/validators";
import * as iaService from "../services/iaService";

export const fetchIAQuestionsController = async (
  req: Request,
  res: Response,
) => {
  const { latitude, longitude } = req.body;

  if (!isNumber(latitude)) {
    throw new HttpError("Missing or invalid field: latitude", 400);
  }

  if (!isNumber(longitude)) {
    throw new HttpError("Missing or invalid field: longitude", 400);
  }

  const question = await iaService.fetchIAQuestion(latitude, longitude);
  res.status(200).json({ question });
};
