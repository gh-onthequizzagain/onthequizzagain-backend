import type { Types } from "mongoose";

import { SessionModel } from "../models/Session";
import { QuestionModel } from "../models/Question";
import { HttpError } from "../middlewares/error";

/**
 * Crée une nouvelle partie de quiz pour l'utilisateur connecté.
 */
export const createSession = async (
  utilisateurId: Types.ObjectId,
  nomTrajet: string,
) => {
  return SessionModel.create({ utilisateurId, nomTrajet });
};

/**
 * Enregistre la réponse du joueur à une question : le scoring est fait côté
 * serveur (comparaison avec `bonneReponse`), jamais côté client.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const answerQuestion = async (
  sessionId: string,
  utilisateurId: Types.ObjectId,
  questionId: string,
  reponseDonnee: string,
) => {
  const session = await SessionModel.findOne({ _id: sessionId, utilisateurId });
  if (!session) throw new HttpError("Session introuvable", 404);

  const question = await QuestionModel.findById(questionId);
  if (!question) throw new HttpError("Question introuvable", 404);

  const correcte = question.bonneReponse === reponseDonnee;

  session.questionsRepondues.push({ questionId: question._id, reponseDonnee, correcte });
  if (correcte) session.scoreTotal += 1;

  await session.save();
  return session;
};

/**
 * Termine une partie en enregistrant sa date de fin.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const endSession = async (
  sessionId: string,
  utilisateurId: Types.ObjectId,
) => {
  const session = await SessionModel.findOne({ _id: sessionId, utilisateurId });
  if (!session) throw new HttpError("Session introuvable", 404);

  session.dateFin = new Date();
  await session.save();
  return session;
};

/**
 * Renvoie l'historique (questions répondues + score) d'une partie.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const getHistory = async (
  sessionId: string,
  utilisateurId: Types.ObjectId,
) => {
  const session = await SessionModel.findOne({ _id: sessionId, utilisateurId });
  if (!session) throw new HttpError("Session introuvable", 404);

  return session;
};
