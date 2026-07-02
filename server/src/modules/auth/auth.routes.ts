import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { registerSchema, loginSchema } from "./auth.validation";
import { loginRateLimiter } from "@/middlewares/rateLimiter.middleware";

const router = Router();

router.post(
  "/register",
  loginRateLimiter,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export const authRoutes = router;
