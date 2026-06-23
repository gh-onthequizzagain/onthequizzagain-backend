import type { Request, Response, NextFunction } from "express";

import { HttpError } from "./error";
import { UserModel } from "../models/User";
import type { UserDocument } from "../models/User";

/**
 * Requête authentifiée : une fois `isAuthenticated` passé, `user` est garanti.
 * Les handlers protégés lisent l'utilisateur via `(req as AuthRequest).user`.
 */
export interface AuthRequest extends Request {
  user: UserDocument;
}

/**
 * Middleware d'authentification par token Bearer.
 *
 * Le client doit envoyer l'en-tête : `Authorization: Bearer <token>`.
 * Le token est celui renvoyé par /api/auth/register ou /api/auth/login.
 *
 * En cas de succès, l'utilisateur est attaché à `req.user`.
 * Express 5 transmet automatiquement les rejets de promesse au errorHandler,
 * donc on peut `throw` directement.
 */
export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError("Token manquant ou invalide", 401);
  }

  const token = header.slice("Bearer ".length).trim();
  const user = await UserModel.findOne({ token });

  if (!user) {
    throw new HttpError("Authentification requise", 401);
  }

  (req as AuthRequest).user = user;
  next();
};
