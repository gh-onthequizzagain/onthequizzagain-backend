/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../middlewares/error";
import { isEmail, isString } from "../helpers/validators";
import * as authService from "../services/authService";

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { email, username, password } = req.body;

    if (!isEmail(email) || !isString(username) || !isString(password)) {
      throw new HttpError("Missing or invalid fields", 400);
    }

    const user = await authService.signup(email, username, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { email, password } = req.body;

    if (!isEmail(email) || !isString(password)) {
      throw new HttpError("Missing or invalid fields", 400);
    }

    const user = await authService.login(email, password);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const profileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req;
    if (!token) throw new HttpError("Unauthorized", 401);

    const user = await authService.getProfile(token);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
