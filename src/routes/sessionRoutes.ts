import { Router } from "express";

import { isAuthenticated } from "../middlewares/auth";
import {
  createSessionController,
  updateSessionController,
  historyController,
} from "../controllers/sessionController";

const router = Router();

// Toutes les routes de session nécessitent d'être authentifié.
router.post("/", isAuthenticated, createSessionController);
router.patch("/:id", isAuthenticated, updateSessionController);
router.get("/:id/history", isAuthenticated, historyController);

export default router;
