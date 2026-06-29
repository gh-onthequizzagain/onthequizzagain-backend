import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createSessionController,
  getLastSessionController,
  updateSessionController,
  addQuestionController,
  answerQuestionController,
} from "../controllers/sessionController";

const router = Router();

router.post("/session", isAuthenticated, createSessionController);
router.get("/session", isAuthenticated, getLastSessionController);
router.patch("/session/:id", isAuthenticated, updateSessionController);
router.post("/session/:id/question", isAuthenticated, addQuestionController);
router.patch(
  "/session/:id/question/:questionId/answer",
  isAuthenticated,
  answerQuestionController,
);

export default router;
