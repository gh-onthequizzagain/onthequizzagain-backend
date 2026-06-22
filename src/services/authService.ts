import type { Types } from "mongoose";
import User from "../models/User";
import { generatePassword } from "../helpers/auth";
import { HttpError } from "../middlewares/error";

export type PublicUser = {
  _id: Types.ObjectId;
  email: string;
  account: { username: string };
  token: string;
};

export const signup = async (
  email: string,
  username: string,
  password: string,
): Promise<PublicUser> => {
  const existing = await User.findOne({ email });
  if (existing) throw new HttpError("Email already in use", 409);

  const { hash, salt, token } = generatePassword(password);

  const user = await User.create({ email, account: { username }, hash, salt, token });

  return { _id: user._id, email: user.email, account: user.account, token: user.token };
};

export const login = async (
  email: string,
  password: string,
): Promise<PublicUser> => {
  const user = await User.findOne({ email });
  if (!user) throw new HttpError("Invalid credentials", 401);

  const { hash } = generatePassword(password, user.salt);
  if (hash !== user.hash) throw new HttpError("Invalid credentials", 401);

  return { _id: user._id, email: user.email, account: user.account, token: user.token };
};

export const getProfile = async (token: string): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  return { _id: user._id, email: user.email, account: user.account, token: user.token };
};
