# 🚀 PHASE 1: Foundation — Khởi Tạo Dự Án & Tooling

> **Độ khó:** ⭐ Beginner
> **Thời lượng ước tính:** 20-30 giờ
> **Prerequisite:** Node.js 18+, PostgreSQL, Git, VS Code

---

## 🎯 MVP Của Phase Này

Sau phase này, em phải có:

- Một project structure sạch, chuẩn convention cho cả Frontend và Backend
- Backend Express chạy được, trả JSON khi gọi `/api/v1/health`
- Environment variables được validate tự động khi khởi động
- ESLint + Prettier chạy OK, code format đồng nhất
- Git repository với `.gitignore` chuẩn

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

- [ ] `git status` hoạt động, `.gitignore` đã commit

---

### Task 1.2: Setup Backend Project (3-4h)

```bash
cd server
npm init -y
```

#### Cài đặt dependencies:

```bash
# === Runtime dependencies ===
npm install express cors dotenv helmet morgan cookie-parser

# === TypeScript & types ===
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/morgan @types/cookie-parser

# === Code quality ===
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# === Validation ===
npm install zod
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
| `ts-node-dev`   | Dev server                    | Auto-restart khi code thay đổi (giống nodemon nhưng cho TS) |

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
    "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

> **Cài thêm** `npm install -D tsconfig-paths` để `@/` alias hoạt động trong dev mode.

#### ⚠️ Lỗi fresher hay mắc:

- **Quên `--transpile-only`:** Không có flag này, `ts-node-dev` sẽ check types mỗi lần restart → chậm x3-5 lần.
- **Dùng `nodemon` cho TypeScript:** `nodemon` không hiểu TypeScript, phải cấu hình phức tạp. `ts-node-dev` sinh ra cho việc này.

#### ✅ Definition of Done:

- [ ] `npm run dev` → server khởi động không lỗi
- [ ] `npm run lint` → pass, không warning
- [ ] Import bằng `@/` alias hoạt động (`import { x } from '@/utils/x'`)

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

- [ ] `npm run dev` → server khởi động, log ra banner đẹp
- [ ] `GET /api/v1/health` → `{ success: true, data: { status: "ok", ... } }`
- [ ] `GET /api/v1/not-exist` → `{ success: false, message: "Cannot GET /api/v1/not-exist" }` (404)
- [ ] `Ctrl+C` → log "Shutting down gracefully..."

---

### Task 1.5: Web Workspace Setup & Directory Restructuring (1-2h)

Để tách biệt mã nguồn cho Buyer, Seller và Admin, chúng ta sẽ cấu hình một không gian làm việc cục bộ (**pnpm Workspace**) dưới thư mục `web/`:

#### Các bước thực hiện:

1. **Cập nhật file `.gitignore` ở root** để ignore các folder build/dependency của workspace mới:

   ```gitignore
   # Web Workspace
   web/**/node_modules/
   web/**/.next/
   web/**/dist/

   # Mobile Workspace
   mobile/**/node_modules/
   mobile/**/.expo/
   mobile/**/dist/
   ```

2. **Di chuyển thư mục `client/` hiện tại sang `web/client-web/`**:
   ```bash
   mkdir -p web
   mv client web/client-web
   ```
3. **Tạo cấu hình Workspace `web/pnpm-workspace.yaml`**:
   ```yaml
   packages:
     - "shared"
     - "client-web"
     - "seller-web"
     - "admin-web"
   ```
4. **Kiểm tra tích hợp workspace**:
   Chạy lệnh `cd web && pnpm install` ở thư mục `web` để xác nhận node_modules được cài đặt thành công cho `web/client-web`.

#### ✅ Definition of Done:

- [✅] Thư mục `client` đã chuyển thành `web/client-web`.
- [✅] File `web/pnpm-workspace.yaml` đã được tạo và cấu hình đúng.
- [✅] Chạy `pnpm install` trong thư mục `web` thành công.

---

### Task 1.6: Setup `web/shared` Package (2-3h)

Tạo thư viện dùng chung cho toàn bộ ứng dụng web (Axios client API, common UI components, hooks).

#### Các bước thực hiện:

1. **Tạo file `web/shared/package.json`**:
   ```json
   {
     "name": "@pixelmart/shared-web",
     "version": "1.0.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "dependencies": {
       "axios": "^1.7.9"
     },
     "peerDependencies": {
       "react": "^19.0.0",
       "react-dom": "^19.0.0"
     }
   }
   ```
2. **Tạo file `web/shared/tsconfig.json`**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["dom", "dom.iterable", "esnext"],
       "module": "ESNext",
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src/**/*"]
   }
   ```
3. **Tạo API Client `web/shared/src/utils/api.ts`**:

   ```typescript
   import axios from "axios";

   export const api = axios.create({
     baseURL: "http://localhost:8000/api/v1",
     withCredentials: true,
     headers: {
       "Content-Type": "application/json",
     },
   });
   ```

4. **Tạo Mock Component `web/shared/src/components/ui/mock-button.tsx`**:

   ```typescript
   import React from 'react';

   interface MockButtonProps {
     label: string;
     onClick?: () => void;
   }

   export const MockButton: React.FC<MockButtonProps> = ({ label, onClick }) => {
     return (
       <button
         style={{ padding: '8px 16px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
         onClick={onClick}
       >
         {label}
       </button>
     );
   };
   ```

5. **Tạo entry point `web/shared/src/index.ts`**:
   ```typescript
   export { api } from "./utils/api";
   export { MockButton } from "./components/ui/mock-button";
   ```
6. **Tạo unit test xác minh API config `web/shared/src/utils/api.test.js`**:

   ```javascript
   import { api } from "./api.ts";
   import assert from "assert";

   try {
     assert.strictEqual(api.defaults.baseURL, "http://localhost:8000/api/v1");
     assert.strictEqual(api.defaults.withCredentials, true);
     console.log("✅ API Client config verified successfully!");
   } catch (error) {
     console.error("❌ API Client verification failed:", error);
     process.exit(1);
   }
   ```

#### ✅ Definition of Done:

- [ ] Gói `web/shared` đã được khởi tạo đầy đủ file config.
- [ ] Chạy kiểm thử: `npx tsx web/shared/src/utils/api.test.js` in ra `✅ API Client config verified successfully!`.

---

### Task 1.7: Scaffold Vite Apps (`seller-web` và `admin-web`) (2-3h)

Khởi tạo các ứng dụng SPA React + Vite cho Kênh người bán (`seller-web`) và Quản trị (`admin-web`).

#### Các bước thực hiện:

1. **Cấu hình `web/seller-web/package.json`**:
   ```json
   {
     "name": "seller-web",
     "private": true,
     "version": "1.0.0",
     "type": "module",
     "scripts": {
       "dev": "vite --port 3001",
       "build": "tsc && vite build",
       "preview": "vite preview"
     },
     "dependencies": {
       "react": "^19.0.0",
       "react-dom": "^19.0.0"
     },
     "devDependencies": {
       "@types/react": "^19.0.0",
       "@types/react-dom": "^19.0.0",
       "@vitejs/plugin-react": "^4.3.4",
       "typescript": "^5.0.0",
       "vite": "^6.0.0"
     }
   }
   ```
2. **Cạo file config `web/seller-web/vite.config.ts`**:

   ```typescript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3001,
     },
   });
   ```

3. **Tạo code template cơ bản** cho `web/seller-web`:
   - `web/seller-web/index.html` (chứa div `#root` và link `src/main.tsx`)
   - `web/seller-web/src/main.tsx` (ReactDOM render `App.tsx`)
   - `web/seller-web/src/App.tsx` (hiển thị tiêu đề `🏪 PixelMart Seller Panel`)
4. **Lặp lại các bước tương tự cho `web/admin-web`** với cổng port `3002` và tiêu đề `👑 PixelMart Admin Dashboard`.

#### ✅ Definition of Done:

- [ ] Hai thư mục ứng dụng Vite được tạo thành công với cấu hình script chạy dev riêng lẻ.

---

### Task 1.8: Link `@pixelmart/shared-web` to All Apps (1-2h)

Liên kết thư viện dùng chung vào 3 ứng dụng web và kiểm thử render.

#### Các bước thực hiện:

1. **Khai báo liên kết** trong `package.json` của `client-web`, `seller-web`, và `admin-web`:
   ```json
   "dependencies": {
     "@pixelmart/shared-web": "workspace:*"
   }
   ```
2. **Cài đặt link**: Chạy `cd web && pnpm install`.
3. **Import MockButton và render** trong:
   - `web/client-web/app/page.tsx`
   - `web/seller-web/src/App.tsx` (khi click gọi `api.defaults.baseURL`)
   - `web/admin-web/src/App.tsx` (khi click gọi `api.defaults.baseURL`)
4. **Verify dev server**:
   Chạy đồng thời:
   - `pnpm --filter client-web dev` (port 3000)
   - `pnpm --filter seller-web dev` (port 3001)
   - `pnpm --filter admin-web dev` (port 3002)

#### ✅ Definition of Done:

- [ ] Cả 3 trang web hiển thị đúng MockButton màu xanh từ package shared, click không lỗi compile.

---

### Task 1.9: Mobile Workspace Placeholder Setup (1-2h)

Thiết lập khung cấu trúc Monorepo cho không gian ứng dụng di động dưới thư mục `mobile/`.

#### Các bước thực hiện:

1. **Tạo file cấu hình workspace `mobile/pnpm-workspace.yaml`**:
   ```yaml
   packages:
     - "shared"
     - "client-mobile"
     - "delivery-mobile"
   ```
2. **Tạo file placeholder `mobile/shared/package.json`**:
   ```json
   {
     "name": "@pixelmart/shared-mobile",
     "version": "1.0.0",
     "private": true,
     "main": "./src/index.js"
   }
   ```
3. **Tạo file placeholder `mobile/client-mobile/package.json`** có dependency `@pixelmart/shared-mobile`.
4. **Tạo file placeholder `mobile/delivery-mobile/package.json`** có dependency `@pixelmart/shared-mobile`.
5. **Chạy cài đặt link**: Chạy `cd mobile && pnpm install`.

#### ✅ Definition of Done:

- [ ] Thư mục `mobile/` chứa cấu trúc workspace và pnpm cài đặt thành công không lỗi.

---

## 🏁 Checklist Cuối Phase 1

- [ ] Git repository khởi tạo, `.gitignore` chuẩn
- [ ] Backend: `npm run dev` → server chạy OK ở port 8000
- [ ] Backend: `/api/v1/health` trả JSON đúng format
- [ ] Backend: 404 handler trả JSON (không HTML)
- [ ] Backend: Error handler trả JSON chuẩn format
- [ ] Backend: ESLint + Prettier pass
- [ ] Backend: `.env` + `.env.example` setup đúng
- [ ] Backend: Env validation crash ngay khi thiếu biến
- [ ] Web Workspace: File `web/pnpm-workspace.yaml` đã được thiết lập đúng
- [ ] Web Shared: Gói `@pixelmart/shared-web` đã khởi tạo và liên kết thành công
- [ ] Web Client: `pnpm --filter client-web dev` → Next.js chạy OK ở port 3000
- [ ] Web Seller: `pnpm --filter seller-web dev` → Vite React chạy OK ở port 3001
- [ ] Web Admin: `pnpm --filter admin-web dev` → Vite React chạy OK ở port 3002
- [ ] Mobile Workspace: File `mobile/pnpm-workspace.yaml` đã được thiết lập đúng
- [ ] Mobile Shared: Gói `@pixelmart/shared-mobile` đã khởi tạo placeholder
- [ ] Mobile Client: `client-mobile` và `delivery-mobile` đã liên kết thành công với shared-mobile
- [ ] **First commit** pushed lên GitHub

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                  | Link                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Express Best Practices  | https://expressjs.com/en/advanced/best-practice-security.html |
| Helmet.js               | https://helmetjs.github.io/                                   |
| Zod Documentation       | https://zod.dev                                               |
| TypeScript Path Aliases | https://www.typescriptlang.org/tsconfig#paths                 |
