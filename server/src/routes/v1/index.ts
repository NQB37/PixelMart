import { Router } from "express";
import { ApiResponse } from "@/utils/ApiResponse";

const router: Router = Router();

router.use("/health", (_req, res) => {
  return ApiResponse.success(res, { message: "OK" });
});

export { router as routes };
