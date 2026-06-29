import type { Types } from "mongoose";
import User from "../models/User";
import { generatePassword } from "../helpers/auth";
import { HttpError } from "../middlewares/error";

export type PublicUser = {
  _id: Types.ObjectId;
  email: string;
  username: string;
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

  const user = await User.create({ email, username, hash, salt, token });

  return { _id: user._id, email: user.email, username: user.username, token: user.token };
};

export const login = async (
  email: string,
  password: string,
): Promise<PublicUser> => {
  const user = await User.findOne({ email });
  if (!user) throw new HttpError("Invalid credentials", 401);

  const { hash } = generatePassword(password, user.salt);
  if (hash !== user.hash) throw new HttpError("Invalid credentials", 401);

  return { _id: user._id, email: user.email, username: user.username, token: user.token };
};

export const getProfile = async (token: string): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  return { _id: user._id, email: user.email, username: user.username, token: user.token };
};

export const modifyProfile = async (
  token: string,
  fields: { username?: string; email?: string },
): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  if (fields.email !== undefined) {
    const existing = await User.findOne({ email: fields.email });
    if (existing && !existing._id?.equals(user._id)) {
      throw new HttpError("Email already in use", 409);
    }
  }

  const updated = await User.findOneAndUpdate({ token }, fields, { new: true });
  if (!updated) throw new HttpError("Unauthorized", 401);

  return {
    _id: updated._id,
    email: updated.email,
    username: updated.username,
    token: updated.token,
  };
};

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<PublicUser> => {
  const user = await User.findOne({ token });
  if (!user) throw new HttpError("Unauthorized", 401);

  const { hash } = generatePassword(currentPassword, user.salt);
  if (hash !== user.hash) throw new HttpError("Invalid credentials", 401);

  const {
    hash: newHash,
    salt: newSalt,
    token: newToken,
  } = generatePassword(newPassword);

  const updated = await User.findOneAndUpdate(
    { token },
    { hash: newHash, salt: newSalt, token: newToken },
    { new: true },
  );
  if (!updated) throw new HttpError("Unauthorized", 401);

  return {
    _id: updated._id,
    email: updated.email,
    username: updated.username,
    token: updated.token,
  };
};
