import type { Request, Response } from "express";

import { HttpError } from "../middlewares/error";
import type { AuthRequest } from "../middlewares/auth";
import { isString, isMongoId } from "../helpers/validators";
import * as sessionService from "../services/sessionService";

/**
 * POST /sessions
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
 * PATCH /sessions/:id
 * - Enregistre une réponse : body { questionId, responseGiven }
 * - OU termine la partie : body { finished: true }
 */
export const updateSessionController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { id } = req.params;
  if (!isMongoId(id))
    throw new HttpError("Identifiant de session invalide", 400);

  const { questionId, responseGiven, finished } = req.body;

  if (finished === true) {
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
 * GET /sessions
 * Liste paginée des parties de l'utilisateur connecté.
 * Query (optionnel) : ?page=1&limit=20
 */
export const listSessionsController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await sessionService.listSessions(user._id, page, limit);
  res.status(200).json(result);
};

/**
 * GET /sessions/:id
 * Renvoie le détail d'une partie.
 */
export const getSessionController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { id } = req.params;
  if (!isMongoId(id))
    throw new HttpError("Identifiant de session invalide", 400);

  const session = await sessionService.getSession(id, user._id);
  res.status(200).json(session);
};

/**
 * GET /sessions/:id/history
 * Renvoie les questions répondues et le score de la partie.
 */
export const historyController = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const { id } = req.params;
  if (!isMongoId(id))
    throw new HttpError("Identifiant de session invalide", 400);

  const session = await sessionService.getHistory(id, user._id);
  res.status(200).json(session);
};
