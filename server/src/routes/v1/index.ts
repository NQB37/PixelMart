import { Router } from "express";
import { ApiResponse } from "@/utils/ApiResponse";
import { authRoutes } from "@/modules/auth/auth.routes";

const router: Router = Router();

router.use("/health", (_req, res) => {
  return ApiResponse.success(res, { message: "OK" });
});

router.use("/auth", authRoutes);

export { router as routes };
