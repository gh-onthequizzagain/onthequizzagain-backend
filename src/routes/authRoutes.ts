import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  signupController,
  loginController,
  profileController,
} from "../controllers/authController";

const router = Router();

router.post("/auth/signup", signupController);
router.post("/auth/login", loginController);
router.get("/auth/profile", isAuthenticated, profileController);

export default router;
