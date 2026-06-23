import type { UserDocument } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: UserDocument;
    }
  }
}

export {};
