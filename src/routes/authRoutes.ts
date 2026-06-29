import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  signupController,
  loginController,
  profileController,
  modifyProfileController,
  passwordController,
  logoutController,
} from "../controllers/authController";

const router = Router();

router.post("/auth/signup", signupController);
router.post("/auth/login", loginController);
router.get("/auth/profile", isAuthenticated, profileController);
router.patch("/auth/profile", isAuthenticated, modifyProfileController);
router.patch("/auth/profile/password", isAuthenticated, passwordController);
router.post("/auth/logout", isAuthenticated, logoutController);

export default router;
