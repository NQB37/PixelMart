import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { routes } from "@/routes/v1";
import { errorHandler } from "@/middlewares/errorHandler.middleware";
import { ApiError } from "@/utils/ApiError";
import { corsOption } from "@/config/cors";
import { env } from "@/config/env";
import helmet from "helmet";
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware";

const app: Express = express();

app.use(helmet());
app.use(cors(corsOption));

// Parsing
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Logging
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.use(apiRateLimiter);

// Routes
app.use("/api/v1", routes);

// 404 Handler
app.all("/*any", (req, _res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Error Handler
app.use(errorHandler);

export default app;
