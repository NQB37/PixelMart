import { Router } from "express";
import * as shopController from "./shop.controller";
import { isAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createShopSchema } from "./shop.validation";

const router = Router();

router.post("/", isAuth, validate(createShopSchema), shopController.createShop);

export const shopRoutes = router;
