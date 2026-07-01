/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { evaluateAllBadges } from "../services/badgeService";
import { logError } from "../helpers/log";

/**
 * Middleware qui évalue les badges de l'utilisateur APRÈS la réponse.
 * À brancher après `isAuthenticated` (utilise `req.token`).
 * L'évaluation se fait sur `res.on("finish")` pour ne pas retarder la réponse ;
 * elle ne tourne que si la requête a réussi (status < 400).
 */
const evaluateBadges = (req: Request, res: Response, next: NextFunction): void => {
  res.on("finish", async () => {
    if (res.statusCode >= 400) return;

    const { token } = req;
    if (!token) return;

    try {
      const user = await User.findOne({ token });
      if (!user) return;

      await evaluateAllBadges(user);
    } catch (error) {
      // Erreur hors cycle req/res : on log sans casser quoi que ce soit.
      logError(`Badge evaluation failed: ${String(error)}`);
    }
  });

  next();
};

export default evaluateBadges;
