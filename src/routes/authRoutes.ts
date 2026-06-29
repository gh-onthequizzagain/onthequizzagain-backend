import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  signupController,
  loginController,
  profileController,
  modifyProfileController,
  passwordController,
} from "../controllers/authController";

const router = Router();

router.post("/auth/signup", signupController);
router.post("/auth/login", loginController);
router.get("/auth/profile", isAuthenticated, profileController);
router.patch("/auth/profile", isAuthenticated, modifyProfileController);
router.patch("/auth/profile/password", isAuthenticated, passwordController);

export default router;
