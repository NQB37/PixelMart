# 🚀 PHASE 1: Foundation — Khởi Tạo Dự Án & Tooling

> **Độ khó:** ⭐ Beginner
> **Thời lượng ước tính:** 20-30 giờ
> **Prerequisite:** Node.js 18+, PostgreSQL, Git, VS Code

---

## 🎯 MVP Của Phase Này

Sau phase này, em phải có:

- Một project structure sạch, chuẩn convention cho Backend
- Backend Express chạy được, trả JSON khi gọi `/api/v1/health`
- Environment variables được validate tự động khi khởi động
- ESLint + Prettier chạy OK, code format đồng nhất
- Git repository với `.gitignore` chuẩn

> [!NOTE]
> 📌 **As-built (codebase là chân lý):** Phase này **hoàn thành**. Toolchain thật: **pnpm** + **`tsx`** (dev `tsx --watch src/server.ts`, seed `pnpm seed`), **không** dùng `tsx`/`tsconfig-paths`. Alias `@/` → `src` khai báo trong `tsconfig.json`. Server chạy port 8000, có `GET /api/v1/health`; `src/config/env.ts` validate biến môi trường bằng Zod; ESLint + Prettier. (Prisma v7 thêm ở Phase 2.)

---

## 📋 Task Breakdown

### Task 1.1: Khởi tạo Git Repository & Root Project (1h)

```bash
cd PixelMart
git init
```

#### Tạo `.gitignore` ở root:

```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Misc
*.tsbuildinfo
```

#### ✅ Definition of Done:

- [x] `git status` hoạt động, `.gitignore` đã commit

---

### Task 1.2: Setup Backend Project (3-4h)

```bash
cd server
pnpm init
```

#### Cài đặt dependencies:

```bash
# === Runtime dependencies ===
pnpm add express cors dotenv helmet morgan cookie-parser

# === TypeScript & types ===
pnpm add -D typescript tsx @types/node @types/express @types/cors @types/morgan @types/cookie-parser

# === Code quality ===
pnpm add -D eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# === Validation ===
pnpm add zod
```

#### Giải thích từng package:

| Package         | Vai trò                       | Tại sao cần                                                 |
| --------------- | ----------------------------- | ----------------------------------------------------------- |
| `express`       | Web framework                 | Handle HTTP requests                                        |
| `cors`          | Cross-Origin Resource Sharing | Cho phép Frontend (port 3000) gọi Backend (port 8000)       |
| `dotenv`        | Load `.env` file              | Quản lý config theo môi trường                              |
| `helmet`        | Security headers              | Set 15+ HTTP security headers tự động                       |
| `morgan`        | HTTP logger                   | Log mỗi request: `GET /api/v1/health 200 3ms`               |
| `cookie-parser` | Parse cookies                 | Đọc JWT từ HttpOnly Cookie                                  |
| `zod`           | Schema validation             | Validate input data type-safe                               |
| `tsx`   | Dev server                    | Auto-restart khi code thay đổi (giống nodemon nhưng cho TS) |

#### Cấu hình `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### Cấu hình `package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx --watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

> Dev runner là `tsx` (`tsx --watch`), tự resolve alias `@/` theo `tsconfig.json` — không cần cấu hình thêm.

#### ⚠️ Lỗi fresher hay mắc:

- **Chạy TypeScript trực tiếp:** dự án dùng `tsx --watch` — nhanh, hiểu TS + ESM sẵn, không cần build bước riêng hay `nodemon`.

#### ✅ Definition of Done:

- [x] `pnpm dev` → server khởi động không lỗi
- [x] `pnpm lint` → pass, không warning
- [x] Import bằng `@/` alias hoạt động (`import { x } from '@/utils/x'`)

---

### Task 1.3: Setup Environment Variables (1-2h)

#### Tạo `.env`:

```env
# Server
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3000

# Database (sẽ dùng ở Phase 2)
DATABASE_URL=postgresql://postgres:password@localhost:5432/pixelmart_dev

# JWT (sẽ dùng ở Phase 3)
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Tạo `.env.example` (PHẢI commit):

```env
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/pixelmart_dev
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Tạo `src/config/env.ts`:

```typescript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8000),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

> **Tại sao dùng `safeParse` thay vì `parse`?**
> `parse` throw error với stack trace dài dòng. `safeParse` cho phép em tự format error message đẹp hơn rồi `process.exit(1)` — fail fast với thông tin rõ ràng.

#### ⚠️ Lỗi fresher hay mắc:

- **Commit `.env` lên GitHub:** Đã có trong `.gitignore` nhưng nếu em đã commit trước đó rồi mới thêm `.gitignore`, file `.env` vẫn bị track. Cách fix: `git rm --cached .env`
- **Dùng `process.env.PORT` trực tiếp khắp nơi:** Không type-safe, dễ typo. Luôn import từ `env.ts` để có autocomplete.

#### ✅ Definition of Done:

- [✅] Xóa `DATABASE_URL` khỏi `.env` → server crash với message rõ ràng
- [✅] `.env` không nằm trong `git status` (đã bị ignore)
- [✅] `.env.example` đã commit

---

### Task 1.4: Viết Express Server Cơ Bản (3-4h)

#### Tạo các file theo thứ tự:

**1. `src/utils/ApiError.ts`** — Custom Error class:

```typescript
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg: string) {
    return new ApiError(400, msg);
  }
  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg: string) {
    return new ApiError(409, msg);
  }
  static internal(msg = "Internal server error") {
    return new ApiError(500, msg, false);
  }
}
```

**2. `src/utils/ApiResponse.ts`** — Chuẩn hóa response format:

```typescript
import { Response } from "express";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = "Created successfully") {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
```

**3. `src/utils/asyncHandler.ts`** — Tự động catch async errors:

```typescript
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

> **Tại sao cần `asyncHandler`?**
> Không có nó, mỗi route phải viết `try { ... } catch(err) { next(err) }`. Với 50 routes = 50 lần lặp lại. `asyncHandler` wrap 1 lần, áp dụng cho tất cả.

**4. `src/middlewares/errorHandler.middleware.ts`**:

```typescript
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { env } from "@/config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Known operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: (err as any).errors,
    });
  }

  // Unknown errors
  console.error("💥 UNEXPECTED ERROR:", err);
  return res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
```

**5. `src/routes/health.route.ts`**:

```typescript
import { Router } from "express";
import { ApiResponse } from "@/utils/ApiResponse";

const router = Router();

router.get("/", (_req, res) => {
  ApiResponse.success(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export const healthRoutes = router;
```

**6. `src/routes/index.ts`** — Route aggregator:

```typescript
import { Router } from "express";
import { healthRoutes } from "./health.route";

const router = Router();

router.use("/health", healthRoutes);

// Thêm routes mới ở đây theo từng phase:
// router.use('/auth', authRoutes);       // Phase 3
// router.use('/shops', shopRoutes);      // Phase 4
// router.use('/products', productRoutes); // Phase 5

export { router as routes };
```

**7. `src/app.ts`** — Express app setup:

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { routes } from "@/routes";
import { errorHandler } from "@/middlewares/errorHandler.middleware";
import { ApiError } from "@/utils/ApiError";

const app = express();

// === Security ===
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Cho phép gửi cookie cross-origin
  }),
);

// === Parsing ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === Logging ===
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// === Routes ===
app.use("/api/v1", routes);

// === 404 Handler ===
app.all("*", (req, _res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// === Error Handler (PHẢI đặt cuối cùng) ===
app.use(errorHandler);

export default app;
```

**8. `src/server.ts`** — Entry point:

```typescript
import app from "@/app";
import { env } from "@/config/env";

const startServer = async () => {
  try {
    // Database connection sẽ thêm ở Phase 2
    // await prisma.$connect();

    app.listen(env.PORT, () => {
      console.log(`
  🚀 PixelMart API Server
  ========================
  Environment : ${env.NODE_ENV}
  Port        : ${env.PORT}
  Health      : http://localhost:${env.PORT}/api/v1/health
  ========================
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
  // await prisma.$disconnect(); // Phase 2
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
```

#### ⚠️ Lỗi fresher hay mắc:

- **Đặt error handler TRƯỚC routes:** Express xử lý middleware theo thứ tự. Error handler phải là middleware CUỐI CÙNG.
- **Quên `credentials: true` trong CORS:** Không có flag này, browser sẽ không gửi cookie kèm theo request → JWT trong HttpOnly Cookie không bao giờ đến được Backend.
- **Không có 404 handler:** Khi user gọi `/api/v1/xyz` (không tồn tại), Express trả về HTML error mặc định. Phải bắt và trả JSON 404.
- **`app.use(morgan('dev'))` ở production:** Log mỗi request ở production sẽ tạo ra lượng log khổng lồ. Chỉ dùng ở development.

#### ✅ Definition of Done:

- [x] `pnpm dev` → server khởi động, log ra banner đẹp
- [x] `GET /api/v1/health` → `{ success: true, data: { status: "ok", ... } }`
- [x] `GET /api/v1/not-exist` → `{ success: false, message: "Cannot GET /api/v1/not-exist" }` (404)
- [x] `Ctrl+C` → log "Shutting down gracefully..."

## 🏁 Checklist Cuối Phase 1

- [x] Git repository khởi tạo, `.gitignore` chuẩn
- [x] Backend: `pnpm dev` → server chạy OK ở port 8000
- [x] Backend: `/api/v1/health` trả JSON đúng format
- [x] Backend: 404 handler trả JSON (không HTML)
- [x] Backend: Error handler trả JSON chuẩn format
- [x] Backend: ESLint + Prettier pass
- [x] Backend: `.env` + `.env.example` setup đúng
- [x] Backend: Env validation crash ngay khi thiếu biến
- [x] **First commit** pushed lên GitHub

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                  | Link                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Express Best Practices  | https://expressjs.com/en/advanced/best-practice-security.html |
| Helmet.js               | https://helmetjs.github.io/                                   |
| Zod Documentation       | https://zod.dev                                               |
| TypeScript Path Aliases | https://www.typescriptlang.org/tsconfig#paths                 |
