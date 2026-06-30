import { HttpError } from "../middlewares/error";
import { isArray, isBoolean, isNumber, isString } from "./validators";
import {
  FrequencyType,
  GameDifficulty,
  GameScreen,
  QuestionMode,
  QuestionStatus,
} from "../models/Session";
import {
  QuestionMode as QuestionQuestionMode,
  QuestionCategory,
} from "../models/Question";

type Player = { name: string; isMainUser: boolean };
type Frequency = { type: FrequencyType; value: number };
type Answer = { id: string; text: string };
export type Question = {
  photo: string;
  locationTitle: string;
  locationDistance: number;
  question: string;
  answers: Answer[];
  solutionId: string;
  type: QuestionQuestionMode;
  funFact: string;
  category: QuestionCategory;
};

export const assertTitle = (value: unknown): string => {
  if (!isString(value)) throw new HttpError("Invalid field: title", 400);
  return value;
};

export const assertPlayerName = (value: unknown): string => {
  if (!isString(value)) throw new HttpError("Invalid field: playerName", 400);
  return value;
};

export const assertStatus = (value: unknown): QuestionStatus => {
  if (!(Object.values(QuestionStatus) as unknown[]).includes(value))
    throw new HttpError("Invalid field: status", 400);
  return value as QuestionStatus;
};

export const assertDifficulty = (value: unknown): GameDifficulty => {
  if (!(Object.values(GameDifficulty) as unknown[]).includes(value))
    throw new HttpError("Invalid field: difficulty", 400);
  return value as GameDifficulty;
};

export const assertHasNotification = (value: unknown): boolean => {
  if (!isBoolean(value))
    throw new HttpError("Invalid field: hasNotification", 400);
  return value;
};

export const assertFrequency = (value: unknown): Frequency => {
  const freq = value as Frequency | null;
  if (
    !freq ||
    !(Object.values(FrequencyType) as unknown[]).includes(freq.type) ||
    !isNumber(freq.value)
  )
    throw new HttpError("Invalid field: frequency", 400);
  return freq;
};

export const assertPlayers = (value: unknown): Player[] => {
  if (
    !isArray<{ name: unknown; isMainUser?: unknown }>(value) ||
    !value.every(
      (p) =>
        p &&
        isString(p.name) &&
        (p.isMainUser === undefined || isBoolean(p.isMainUser)),
    )
  )
    throw new HttpError("Invalid field: players", 400);

  return value.map((p) => ({
    name: p.name as string,
    isMainUser: p.isMainUser === true,
  }));
};

export const assertQuestionModes = (value: unknown): QuestionMode[] => {
  if (
    !isArray<unknown>(value) ||
    !value.every((m) => (Object.values(QuestionMode) as unknown[]).includes(m))
  )
    throw new HttpError("Invalid field: questionModes", 400);
  return value as QuestionMode[];
};

export const assertScreen = (value: unknown): GameScreen => {
  if (!(Object.values(GameScreen) as unknown[]).includes(value))
    throw new HttpError("Invalid field: screen", 400);
  return value as GameScreen;
};

export const assertStepIndex = (value: unknown): number => {
  if (!isNumber(value) || !Number.isInteger(value) || value < 1)
    throw new HttpError("Invalid field: stepIndex", 400);
  return value;
};

const assertAnswers = (value: unknown): Answer[] => {
  if (
    !isArray<{ id: unknown; text: unknown }>(value) ||
    !value.every((a) => a && isString(a.id) && isString(a.text))
  )
    throw new HttpError("Invalid field: answers", 400);
  return value.map((a) => ({ id: a.id as string, text: a.text as string }));
};

export const assertQuestion = (value: unknown): Question => {
  const q = value as Partial<Question> | null;
  if (!q) throw new HttpError("Invalid field: question", 400);

  if (!isString(q.photo)) throw new HttpError("Invalid field: photo", 400);
  if (!isString(q.locationTitle))
    throw new HttpError("Invalid field: locationTitle", 400);
  if (!isNumber(q.locationDistance))
    throw new HttpError("Invalid field: locationDistance", 400);
  if (!isString(q.question))
    throw new HttpError("Invalid field: question", 400);
  if (!isString(q.solutionId))
    throw new HttpError("Invalid field: solutionId", 400);
  if (!(Object.values(QuestionQuestionMode) as unknown[]).includes(q.type))
    throw new HttpError("Invalid field: type", 400);
  if (!isString(q.funFact))
    throw new HttpError("Invalid field: funFact", 400);
  if (!(Object.values(QuestionCategory) as unknown[]).includes(q.category))
    throw new HttpError("Invalid field: category", 400);

  return {
    photo: q.photo,
    locationTitle: q.locationTitle,
    locationDistance: q.locationDistance,
    question: q.question,
    answers: assertAnswers(q.answers),
    solutionId: q.solutionId,
    type: q.type as QuestionQuestionMode,
    funFact: q.funFact,
    category: q.category as QuestionCategory,
  };
};
