import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import { listBadgesController } from "../controllers/badgeController";

const router = Router();

router.get("/badges", isAuthenticated, listBadgesController);

export default router;
