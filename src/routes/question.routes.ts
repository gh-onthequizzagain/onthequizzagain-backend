import { Router } from "express";
import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error";
import { isAuthenticated } from "../middlewares/auth";
import { QuestionModel } from "../models/question.model";
import { MAX_SEARCH_RADIUS } from "../constants";
import { isLatitude, isLongitude, isPublicCible } from "../helpers/validators";

const router = Router();

/**
 * GET /api/questions/nearby?lng=&lat=&public=
 * Récupère les questions dont le point d'intérêt est suffisamment proche de la
 * position GPS fournie : on ne garde que celles dont la distance réelle est
 * inférieure ou égale à leur propre `rayonDeclenchement`.
 *
 * `public` (optionnel) : "parent" | "enfant" | "tous". Les questions "tous"
 * sont toujours incluses.
 *
 * Sécurité : la bonne réponse n'est jamais renvoyée au client (le scoring se
 * fait côté serveur via PATCH /api/sessions/:id).
 */
router.get("/nearby", isAuthenticated, async (req: Request, res: Response) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);

  if (!isLongitude(lng) || !isLatitude(lat)) {
    throw new HttpError(
      "Coordonnées GPS invalides (paramètres lng et lat requis)",
      400,
    );
  }

  const publicParam = req.query.public;
  const publicFilter =
    isPublicCible(publicParam) && publicParam !== "tous"
      ? { publicCible: { $in: [publicParam, "tous"] } }
      : {};

  const questions = await QuestionModel.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance", // distance en mètres (spherical)
        spherical: true,
        maxDistance: MAX_SEARCH_RADIUS,
        query: publicFilter,
      },
    },
    // On ne conserve que les questions dans leur rayon de déclenchement.
    { $match: { $expr: { $lte: ["$distance", "$rayonDeclenchement"] } } },
    // On masque la bonne réponse avant de renvoyer au client.
    { $project: { bonneReponse: 0 } },
  ]);

  res.json(questions);
});

export default router;
