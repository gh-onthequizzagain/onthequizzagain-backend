import { Router } from "express";
import { HttpError } from "../middlewares/error";
import type { Request, Response } from "express";

const router = Router();

// WELCOME;
router.get("/", async (_: Request, res: Response) => {
  res.json({ message: "welcome on the Quizz API" });

  // pour lever une erreur vous faite juste :
  // throw new HttpError("message", code_erreur);
  // ex : throw new HttpError("je suis une erreur", 500)
  // la réponse du server sera :
});

// 404
router.all(/.*/, async () => {
  throw new HttpError("service not found", 404);
});

export default router;
