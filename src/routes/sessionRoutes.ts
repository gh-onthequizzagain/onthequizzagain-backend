import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createSessionController,
  getSessionHistoryController,
  getLastSessionController,
  getSessionController,
  updateSessionController,
  addQuestionController,
  answerQuestionController,
} from "../controllers/sessionController";

const router = Router();

router.post("/session", isAuthenticated, createSessionController);
router.get("/session", isAuthenticated, getLastSessionController);
router.get("/session/history", isAuthenticated, getSessionHistoryController);
router.get("/session/:id", isAuthenticated, getSessionController);
router.patch("/session/:id", isAuthenticated, updateSessionController);
router.post("/session/:id/question", isAuthenticated, addQuestionController);
router.patch("/session/:id/question/:questionId", isAuthenticated, answerQuestionController);

export default router;
