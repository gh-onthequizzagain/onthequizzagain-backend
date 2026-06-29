/// <reference path="../types/express.d.ts" />
import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error";
import { isEmail, isString } from "../helpers/validators";
import * as authService from "../services/authService";

export const signupController = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!isEmail(email) || !isString(username) || !isString(password)) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const user = await authService.signup(email, username, password);
  res.status(201).json(user);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isEmail(email) || !isString(password)) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const user = await authService.login(email, password);
  res.status(200).json(user);
};

export const profileController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const user = await authService.getProfile(token);
  res.status(200).json(user);
};

export const modifyProfileController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { username, email } = req.body;

  const usernameValid = isString(username) && username.trim().length > 0;
  const emailValid = isEmail(email);

  if (!usernameValid && !emailValid) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const fields: { username?: string; email?: string } = {};
  if (usernameValid) fields.username = username;
  if (emailValid) fields.email = email;

  const user = await authService.modifyProfile(token, fields);
  res.status(200).json(user);
};

export const passwordController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const { currentPassword, newPassword } = req.body;

  if (!isString(currentPassword) || !isString(newPassword)) {
    throw new HttpError("Missing or invalid fields", 400);
  }

  const user = await authService.changePassword(token, currentPassword, newPassword);
  res.status(200).json(user);
};
