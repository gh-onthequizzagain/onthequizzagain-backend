import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error";
import { isNumber, isAudienceType, isQuestionMode } from "../helpers/validators";
import * as iaService from "../services/iaService";
import { QuestionMode } from "../models/Question";

export const fetchIAQuestionsController = async (
  req: Request,
  res: Response,
) => {
  const {
    latitude,
    longitude,
    type = QuestionMode.MultipleChoice,
    audience = "adultes",
  } = req.body;

  if (!isNumber(latitude)) {
    throw new HttpError("Missing or invalid field: latitude", 400);
  }

  if (!isNumber(longitude)) {
    throw new HttpError("Missing or invalid field: longitude", 400);
  }

  if (!isQuestionMode(type)) {
    throw new HttpError(
      "Invalid field: type must be 'multipleChoice' or 'trueFalse'",
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
    type,
    audience,
  );
  res.status(200).json({ question });
};
