import { Router } from "express";

import { isAuthenticated } from "../middlewares/auth";
import {
  createSessionController,
  updateSessionController,
  historyController,
  listSessionsController,
  getSessionController,
} from "../controllers/sessionController";

const router = Router();

// Toutes les routes de session nécessitent d'être authentifié.
router.post("/", isAuthenticated, createSessionController);
router.get("/", isAuthenticated, listSessionsController);
router.patch("/:id", isAuthenticated, updateSessionController);
router.get("/:id/history", isAuthenticated, historyController);
router.get("/:id", isAuthenticated, getSessionController);

export default router;
