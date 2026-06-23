import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import { fetchIAQuestionsController } from "../controllers/iaController";

const router = Router();

router.post("/ia/question", isAuthenticated, fetchIAQuestionsController);

export default router;
