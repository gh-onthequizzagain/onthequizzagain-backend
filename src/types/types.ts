import { Response } from "express";
import { Types } from "mongoose";

export type JsonResponse<T> = Response<T>;
export type MessageResponse = { message: string };
export type MongoId = {
  _id: Types.ObjectId;
};

export type AudienceType = "enfants" | "adolescents" | "adultes";

export type PublicCibleType = "parent" | "enfant" | "tous";
export type SessionQuestionType = "QCM" | "vraifaux" | "both";

