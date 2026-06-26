import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error";
import { isNumber, isAudienceType } from "../helpers/validators";
import * as iaService from "../services/iaService";
import type { QuestionType } from "../services/iaService";

const VALID_TYPES: QuestionType[] = ["QCM", "vraifaux"];

export const fetchIAQuestionsController = async (
  req: Request,
  res: Response,
) => {
  const { latitude, longitude, type = "QCM", audience = "adultes" } = req.body;

  if (!isNumber(latitude)) {
    throw new HttpError("Missing or invalid field: latitude", 400);
  }

  if (!isNumber(longitude)) {
    throw new HttpError("Missing or invalid field: longitude", 400);
  }

  if (!VALID_TYPES.includes(type as QuestionType)) {
    throw new HttpError(
      "Invalid field: type must be 'QCM' or 'vraifaux'",
      400,
    );
  }

  if (!isAudienceType(audience)) {
    throw new HttpError(
      "Invalid field: audience must be 'enfants', 'adolescents' or 'adultes'",
      400,
    );
  }

  const question = await iaService.fetchIAQuestion(
    latitude,
    longitude,
    type as QuestionType,
    audience,
  );
  res.status(200).json({ question });
};
