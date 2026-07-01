import type { AudienceType, TargetAudienceType } from "../types/types";
import { QuestionMode } from "../models/Question";

export const isString = (str: unknown): str is string =>
  typeof str === "string";

export const isAudienceType = (value: unknown): value is AudienceType =>
  value === "enfants" || value === "adolescents" || value === "adultes";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

export const isBoolean = (value: unknown): value is boolean =>
  value === true || value === false;

export const isMongoId = (value: unknown): value is string => {
  return isString(value) && /^[a-fA-F0-9]{24}$/.test(value as string);
};

export const isArray = <T>(value: unknown): value is T[] =>
  Array.isArray(value);

export const isDate = (value: unknown): value is string => {
  //format : YYYY-MM-DD (string)
  if (!isString(value)) return false;

  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value))
    return false;

  const year = Number(value.split("-")[0]);

  return year > 1970;
};

export const isEmail = (value: unknown): value is string => {
  if (!isString(value)) return false;

  return /^[a-z0-9_.-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
};

export const isTargetAudience = (value: unknown): value is TargetAudienceType =>
  value === "parent" || value === "child" || value === "all";

export const isQuestionMode = (value: unknown): value is QuestionMode =>
  value === QuestionMode.MultipleChoice || value === QuestionMode.TrueFalse;
