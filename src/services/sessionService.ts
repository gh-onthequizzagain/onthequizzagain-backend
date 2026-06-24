import type { Types } from "mongoose";

import { SessionModel } from "../models/Session";
import { QuestionModel } from "../models/Question";
import { HttpError } from "../middlewares/error";

/**
 * Crée une nouvelle partie de quiz pour l'utilisateur connecté.
 */
export const createSession = async (
  userId: Types.ObjectId,
  routeName: string,
) => {
  return SessionModel.create({ userId, routeName });
};

/**
 * Enregistre la réponse du joueur à une question : le scoring est fait côté
 * serveur (comparaison avec `correctAnswer`), jamais côté client.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const answerQuestion = async (
  sessionId: string,
  userId: Types.ObjectId,
  questionId: string,
  responseGiven: string,
) => {
  const session = await SessionModel.findOne({ _id: sessionId, userId });
  if (!session) throw new HttpError("Session introuvable", 404);

  // On ne peut pas répondre à une partie déjà terminée.
  if (session.endDate)
    throw new HttpError("Cette partie est déjà terminée", 409);

  // Une même question ne peut être répondue qu'une seule fois (anti gonflage du score).
  const alreadyAnswered = session.answeredQuestions.some(
    (answer) => answer.questionId.toString() === questionId,
  );
  if (alreadyAnswered) throw new HttpError("Question déjà répondue", 409);

  const question = await QuestionModel.findById(questionId);
  if (!question) throw new HttpError("Question introuvable", 404);

  const isCorrect = question.correctAnswer === responseGiven;

  session.answeredQuestions.push({
    questionId: question._id,
    responseGiven,
    isCorrect,
  });
  if (isCorrect) session.totalScore += 1;

  await session.save();
  return session;
};

/**
 * Termine une partie en enregistrant sa date de fin.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const endSession = async (sessionId: string, userId: Types.ObjectId) => {
  const session = await SessionModel.findOne({ _id: sessionId, userId });
  if (!session) throw new HttpError("Session introuvable", 404);

  // On ne peut pas terminer deux fois la même partie.
  if (session.endDate)
    throw new HttpError("Cette partie est déjà terminée", 409);

  session.endDate = new Date();
  await session.save();
  return session;
};

/**
 * Liste paginée des parties de l'utilisateur connecté, les plus récentes
 * d'abord. Renvoie aussi les métadonnées de pagination.
 */
export const listSessions = async (
  userId: Types.ObjectId,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    SessionModel.find({ userId })
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    SessionModel.countDocuments({ userId }),
  ]);

  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Renvoie le détail d'une partie.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const getSession = async (sessionId: string, userId: Types.ObjectId) => {
  const session = await SessionModel.findOne({ _id: sessionId, userId });
  if (!session) throw new HttpError("Session introuvable", 404);

  return session;
};

/**
 * Renvoie l'historique (questions répondues + score) d'une partie.
 * Vérifie que la session appartient bien à l'utilisateur.
 */
export const getHistory = async (sessionId: string, userId: Types.ObjectId) => {
  const session = await SessionModel.findOne({ _id: sessionId, userId });
  if (!session) throw new HttpError("Session introuvable", 404);

  return session;
};
