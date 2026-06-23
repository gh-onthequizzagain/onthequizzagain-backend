import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error";
import type { AuthRequest } from "../middlewares/auth";
import { isString, isMongoId } from "../helpers/validators";
import * as sessionService from "../services/sessionService";

/**
 * POST /api/sessions
 * Démarre une nouvelle partie pour l'utilisateur connecté.
 * Body (optionnel) : { routeName }
 */
export const createSessionController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { routeName } = req.body;

  if (routeName !== undefined && !isString(routeName)) {
    throw new HttpError("routeName invalide", 400);
  }

  const session = await sessionService.createSession(
    user._id,
    isString(routeName) ? routeName : "",
  );
  res.status(201).json(session);
};

/**
 * PATCH /api/sessions/:id
 * - Enregistre une réponse : body { questionId, responseGiven }
 * - OU termine la partie : body { termine: true }
 */
export const updateSessionController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { id } = req.params;
  if (!isMongoId(id)) throw new HttpError("Identifiant de session invalide", 400);

  const { questionId, responseGiven, termine } = req.body;

  if (termine === true) {
    const session = await sessionService.endSession(id, user._id);
    res.status(200).json(session);
    return;
  }

  if (!isMongoId(questionId) || !isString(responseGiven)) {
    throw new HttpError(
      "Champs requis : questionId (ObjectId) et responseGiven (string)",
      400,
    );
  }

  const session = await sessionService.answerQuestion(
    id,
    user._id,
    questionId,
    responseGiven,
  );
  res.status(200).json(session);
};

/**
 * GET /api/sessions/:id/history
 * Renvoie les questions répondues et le score de la partie.
 */
export const historyController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { id } = req.params;
  if (!isMongoId(id)) throw new HttpError("Identifiant de session invalide", 400);

  const session = await sessionService.getHistory(id, user._id);
  res.status(200).json(session);
};
