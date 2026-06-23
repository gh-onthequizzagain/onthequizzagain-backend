import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error";
import { isLatitude, isLongitude, isTargetAudience } from "../helpers/validators";
import * as questionService from "../services/questionService";

/**
 * GET /api/questions/nearby?lng=&lat=&public=
 * Renvoie les questions à proximité de la position GPS fournie.
 */
export const nearbyController = async (req: Request, res: Response) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);

  if (!isLongitude(lng) || !isLatitude(lat)) {
    throw new HttpError(
      "Coordonnées GPS invalides (paramètres lng et lat requis)",
      400,
    );
  }

  const publicParam = req.query.public;
  const targetAudience = isTargetAudience(publicParam) ? publicParam : undefined;

  const questions = await questionService.findNearby(lng, lat, targetAudience);
  res.json(questions);
};
