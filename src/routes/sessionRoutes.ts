import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import evaluateBadges from "../middlewares/evaluateBadges";
import {
  createSessionController,
  getLastSessionController,
  getSessionController,
  updateSessionController,
  addQuestionController,
  answerQuestionController,
} from "../controllers/sessionController";

const router = Router();

router.post("/session", isAuthenticated, evaluateBadges, createSessionController);
router.get("/session", isAuthenticated, getLastSessionController);
router.get("/session/:id", isAuthenticated, getSessionController);
router.patch("/session/:id", isAuthenticated, evaluateBadges, updateSessionController);
router.post("/session/:id/question", isAuthenticated, evaluateBadges, addQuestionController);
router.patch("/session/:id/question/:questionId", isAuthenticated, evaluateBadges, answerQuestionController);

export default router;
