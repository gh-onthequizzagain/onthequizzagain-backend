import type { Request, Response } from "express";
import { Types } from "mongoose";
import { HttpError } from "../middlewares/error";
import {
  isNumber,
  isMongoId,
  isPublicCibleType,
  isSessionQuestionType,
} from "../helpers/validators";
import { findNearestQuestion } from "../services/questionService";

export const getNearestQuestionController = async (
  req: Request,
  res: Response,
) => {
  const {
    latitude,
    longitude,
    publicCible = "tous",
    type = "both",
    excludeIds = [],
  } = req.body;

  if (!isNumber(latitude)) {
    throw new HttpError("Missing or invalid field: latitude", 400);
  }

  if (!isNumber(longitude)) {
    throw new HttpError("Missing or invalid field: longitude", 400);
  }

  if (!isPublicCibleType(publicCible)) {
    throw new HttpError(
      "Invalid field: publicCible must be 'parent', 'enfant' or 'tous'",
      400,
    );
  }

  if (!isSessionQuestionType(type)) {
    throw new HttpError(
      "Invalid field: type must be 'QCM', 'vraifaux' or 'both'",
      400,
    );
  }

  if (!Array.isArray(excludeIds) || !excludeIds.every(isMongoId)) {
    throw new HttpError(
      "Invalid field: excludeIds must be an array of MongoDB ObjectId strings",
      400,
    );
  }

  const objectIds = (excludeIds as string[]).map((id) => new Types.ObjectId(id));

  const question = await findNearestQuestion({
    latitude,
    longitude,
    publicCible,
    type,
    excludeIds: objectIds,
  });

  if (!question) {
    throw new HttpError("No question found near your location", 404);
  }

  res.status(200).json({ question });
};
