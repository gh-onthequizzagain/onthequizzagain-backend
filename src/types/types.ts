import { Response } from "express";
import { Types } from "mongoose";


export type JsonResponse<T> = Response<T>;
export type MessageResponse = { message: string };
export type MongoId = {
  _id: Types.ObjectId;
};

