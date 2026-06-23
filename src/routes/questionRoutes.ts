import { Router } from "express";

import { isAuthenticated } from "../middlewares/auth";
import { nearbyController } from "../controllers/questionController";

const router = Router();

// GET /api/questions/nearby?lng=&lat=&public=
router.get("/nearby", isAuthenticated, nearbyController);

export default router;
