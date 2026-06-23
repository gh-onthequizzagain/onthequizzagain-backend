/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "./error";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.headers.authorization;

  if (!authorization) throw new HttpError("Unauthorized", 401);

  req.token = authorization.replace("Bearer ", "");
  next();
};

export default isAuthenticated;
