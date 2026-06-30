/// <reference path="../types/express.d.ts" />
import type { Request } from "express";
import { HttpError } from "../middlewares/error";
import { isMongoId } from "../helpers/validators";
import type { JsonResponse } from "../types/types";
import type { SessionType } from "../models/Session";
import {
  assertTitle,
  assertDifficulty,
  assertHasNotification,
  assertFrequency,
  assertPlayers,
  assertQuestionModes,
  assertScreen,
  assertStepIndex,
  assertQuestion,
  assertPlayerName,
  assertStatus,
} from "../helpers/sessionAssert";
import * as sessionService from "../services/sessionService";
import * as questionService from "../services/questionService";
import type { SessionPatch } from "../services/sessionService";

export const createSessionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const session = await sessionService.createSession(token);
  res.status(201).json(session);
};

export const getSessionHistoryController = async (
  req: Request,
  res: JsonResponse<SessionType[]>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const sessions = await sessionService.getAllSessions(token);
  res.status(200).json(sessions);
};

export const getLastSessionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const session = await sessionService.getLastSession(token);
  res.status(200).json(session);
};

export const getSessionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { id } = req.params;
  if (!isMongoId(id)) throw new HttpError("Invalid session id", 400);

  const session = await sessionService.getSessionById(token, id);
  res.status(200).json(session);
};

export const updateSessionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { id } = req.params;
  if (!isMongoId(id)) throw new HttpError("Invalid session id", 400);

  const {
    players,
    screen,
    stepIndex,
    title,
    frequency,
    difficulty,
    questionModes,
    hasNotification,
  } = req.body;

  const patch: SessionPatch = {};

  if (players !== undefined) patch.players = assertPlayers(players);
  if (screen !== undefined) patch.screen = assertScreen(screen);
  if (stepIndex !== undefined) patch.stepIndex = assertStepIndex(stepIndex);
  if (title !== undefined) patch.title = assertTitle(title);
  if (frequency !== undefined) patch.frequency = assertFrequency(frequency);
  if (difficulty !== undefined) patch.difficulty = assertDifficulty(difficulty);
  if (questionModes !== undefined)
    patch.questionModes = assertQuestionModes(questionModes);
  if (hasNotification !== undefined)
    patch.hasNotification = assertHasNotification(hasNotification);

  const session = await sessionService.updateSession(token, id, patch);
  res.status(200).json(session);
};

export const addQuestionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { id } = req.params;
  if (!isMongoId(id)) throw new HttpError("Invalid session id", 400);

  const questionData = assertQuestion(req.body);
  const playerName = assertPlayerName(req.body.playerName);

  const question = await questionService.createQuestion(questionData);
  const session = await sessionService.addQuestionToSession(
    token,
    id,
    question._id,
    playerName,
  );

  res.status(200).json(session);
};

export const answerQuestionController = async (
  req: Request,
  res: JsonResponse<SessionType>,
) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { id, questionId } = req.params;
  if (!isMongoId(id)) throw new HttpError("Invalid session id", 400);
  if (!isMongoId(questionId))
    throw new HttpError("Invalid question id", 400);

  const status = assertStatus(req.body.status);

  const session = await sessionService.answerQuestion(
    token,
    id,
    questionId,
    status,
  );

  res.status(200).json(session);
};
