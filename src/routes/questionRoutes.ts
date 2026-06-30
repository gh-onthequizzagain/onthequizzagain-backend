import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import { getNearestQuestionController } from "../controllers/questionController";

const router = Router();

router.post("/questions/nearest", isAuthenticated, getNearestQuestionController);

export default router;
