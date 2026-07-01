/// <reference path="../types/express.d.ts" />
import type { Request, Response } from "express";
import { HttpError } from "../middlewares/error";
import * as badgeService from "../services/badgeService";

export const listBadgesController = async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) throw new HttpError("Unauthorized", 401);

  const badges = await badgeService.listBadges(token);
  res.status(200).json(badges);
};
