import { QuestionModel } from "../models/Question";
import { MAX_SEARCH_RADIUS } from "../constants";
import type { TargetAudience } from "../helpers/validators";

/**
 * Récupère les questions dont le point d'intérêt est suffisamment proche de la
 * position GPS fournie : on ne garde que celles dont la distance réelle est
 * inférieure ou égale à leur propre `triggerRadius`.
 *
 * `targetAudience` (optionnel) restreint aux questions du public visé ; les
 * questions "tous" sont toujours incluses.
 *
 * Sécurité : la bonne réponse n'est jamais renvoyée (le scoring se fait côté
 * serveur via PATCH /api/sessions/:id).
 */
export const findNearby = async (
  lng: number,
  lat: number,
  targetAudience?: TargetAudience,
) => {
  const publicFilter =
    targetAudience && targetAudience !== "tous"
      ? { TargetAudience: { $in: [targetAudience, "tous"] } }
      : {};

  return QuestionModel.aggregate([
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
    { $match: { $expr: { $lte: ["$distance", "$triggerRadius"] } } },
    // On masque la bonne réponse avant de renvoyer au client.
    { $project: { correctAnswer: 0 } },
  ]);
};
