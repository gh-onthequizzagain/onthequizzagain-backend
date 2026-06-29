import User from "../models/User";
import Session, {
  type FrequencyType,
  type GameDifficulty,
  type GameScreen,
  type QuestionMode,
  type QuestionStatus,
} from "../models/Session";
import type { Types } from "mongoose";
import { HttpError } from "../middlewares/error";

export type SessionPatch = {
  players?: { name: string; isMainUser: boolean }[];
  screen?: GameScreen;
  stepIndex?: number;
  title?: string;
  frequency?: { type: FrequencyType; value: number };
  difficulty?: GameDifficulty;
  questionModes?: QuestionMode[];
  hasNotification?: boolean;
};

export const createSession = async (token: string) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const session = await Session.create({
    user: user._id,
    players: [{ name: user.username, isMainUser: true }],
  });

  return session;
};

export const getLastSession = async (token: string) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const session = await Session.findOne({ user: user._id }).sort({
    createdAt: -1,
  });
  if (!session) throw new HttpError("Session not found", 404);

  return session;
};

export const updateSession = async (token: string, id: string, patch: SessionPatch) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const session = await Session.findOneAndUpdate({ _id: id, user: user._id }, patch, {
    new: true,
    runValidators: true,
  });
  if (!session) throw new HttpError("Session not found", 404);

  return session;
};

export const addQuestionToSession = async (
  token: string,
  id: string,
  questionId: Types.ObjectId,
  playerName: string
) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const session = await Session.findOne({ _id: id, user: user._id });
  if (!session) throw new HttpError("Session not found", 404);

  session.questions.push({ question: questionId, playerName });
  await session.save();

  return session;
};

export const answerQuestion = async (
  token: string,
  id: string,
  questionId: string,
  status: QuestionStatus,
) => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const session = await Session.findOne({ _id: id, user: user._id });
  if (!session) throw new HttpError("Session not found", 404);

  const entry = session.questions.find(
    (q) => q.question?.toString() === questionId,
  );
  if (!entry) throw new HttpError("Question not found in session", 404);

  entry.status = status;
  await session.save();

  return session;
};
