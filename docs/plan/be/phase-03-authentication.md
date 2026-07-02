# 🔐 PHASE 3: Authentication & Authorization (Multi-Role)

> **Prerequisite:** Phase 2 hoàn thành, DB PostgreSQL đã kết nối thành công.

---

## 🎯 MVP Của Phase Này

- User đăng ký, đăng nhập, đăng xuất thành công
- JWT Access Token + Refresh Token hoạt động (HttpOnly Cookie)
- Refresh Token rotation (tự cấp token mới khi hết hạn)
- Middleware phân quyền: `isAuthenticated`, `authorize('ADMIN', 'SELLER')`
- Trang Admin chặn User thường (403), Frontend redirect đúng

---

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta cần tạo bảng người dùng (`User`) và hồ sơ (`Profile`), hệ thống phân quyền RBAC (`Role`, `Permission`, `UserRoles`, `RolePermissions`) và quản lý phiên đăng nhập (`RefreshToken`).

### 1. Thêm Vào `prisma/schema.prisma`:

```prisma
enum UserProvider {
  CREDENTIALS
  GOOGLE
}

// Tên enum là ROLE (viết hoa). User KHÔNG có cột role — quyền lấy qua RBAC.
enum ROLE {
  CUSTOMER
  SELLER
  ADMIN
  DELIVERY_PERSON
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model User {
  id        String       @id @default(uuid())
  email     String       @unique
  password  String?      // nullable — user đăng nhập bằng OAuth (Google) không có password
  provider  UserProvider @default(CREDENTIALS)
  isActive  Boolean      @default(true)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  profile       Profile?
  refreshTokens RefreshToken[]
  roles         UserRoles[]

  @@index([email])
  @@map("users")
}

// Thông tin cá nhân tách khỏi User (quan hệ 1-1)
model Profile {
  id          String    @id @default(uuid())
  userId      String    @unique
  fullName    String
  avatarUrl   String?
  phoneNumber String?
  dateOfBirth DateTime?
  gender      Gender?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// ===== RBAC: User có NHIỀU role, mỗi role có nhiều permission =====
model Role {
  id          String   @id @default(uuid())
  name        ROLE     @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userRoles       UserRoles[]
  rolePermissions RolePermissions[]

  @@index([name])
  @@map("roles")
}

model UserRoles {
  userId String
  roleId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([roleId])
  @@map("user_roles")
}

model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  rolePermissions RolePermissions[]

  @@index([name])
  @@map("permissions")
}

model RolePermissions {
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}
```

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name init_auth
```

### 3. Viết Seed Data Cho `prisma/seed.ts`:

Hãy cập nhật hàm `main()` trong file `prisma/seed.ts` để tạo sẵn tài khoản Admin và Buyer làm test case:

```typescript
import { PrismaClient, ROLE } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Phase 3...");

  // 1. Seed 4 role của hệ thống RBAC
  const roleNames: ROLE[] = ["CUSTOMER", "SELLER", "ADMIN", "DELIVERY_PERSON"];
  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  // (Permission + RolePermissions được seed tương tự rồi gán vào từng Role)

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMIN" },
  });
  const customerRole = await prisma.role.findUniqueOrThrow({
    where: { name: "CUSTOMER" },
  });

  const hashedPassword = await bcrypt.hash("Password@123", 12);

  // 2. Seed Admin — tạo User + Profile + gán role qua UserRoles
  await prisma.user.upsert({
    where: { email: "admin@pixelmart.com" },
    update: {},
    create: {
      email: "admin@pixelmart.com",
      password: hashedPassword,
      profile: { create: { fullName: "Admin PixelMart" } },
      roles: { create: { roleId: adminRole.id } },
    },
  });

  // 3. Seed Customer
  await prisma.user.upsert({
    where: { email: "buyer1@pixelmart.com" },
    update: {},
    create: {
      email: "buyer1@pixelmart.com",
      password: hashedPassword,
      profile: { create: { fullName: "Trần Thị Buyer" } },
      roles: { create: { roleId: customerRole.id } },
    },
  });

  console.log("✅ Seeding Phase 3 complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Chạy lệnh seed để đổ dữ liệu vào DB:

```bash
npx prisma db seed
```

---

## 📋 Task Breakdown

### Task 3.1: Viết Auth Utility Functions (2-3h)

#### `src/utils/hash.ts`:

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

> **Tại sao `SALT_ROUNDS = 12`?**
>
> - `10` = ~10ms (nhanh, đủ cho dev)
> - `12` = ~40ms (cân bằng giữa bảo mật và tốc độ — recommended cho production)
> - `14` = ~160ms (an toàn hơn nhưng chậm, ảnh hưởng UX)
>   Brute force cần thử hàng triệu password → mỗi lần mất 40ms = hàng năm mới phá được.

#### `src/utils/token.ts`:

```typescript
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

interface TokenPayload {
  userId: string;
  email: string;
  jti: string; // token id — dùng cho rotation/revoke, nằm trong JWT (không lưu DB)
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};
```

**Cài đặt:**

```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

#### `src/utils/cookie.ts`:

```typescript
import { Response } from "express";
import { env } from "@/config/env";

const isProduction = env.NODE_ENV === "production";

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  // Access Token — short-lived
  res.cookie("access_token", accessToken, {
    httpOnly: true, // JavaScript không đọc được (chống XSS)
    secure: isProduction, // Chỉ gửi qua HTTPS ở production
    sameSite: "lax", // Chống CSRF cơ bản
    maxAge: 15 * 60 * 1000, // 15 phút
    path: "/",
  });

  // Refresh Token — long-lived
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    path: "/api/v1/auth/refresh", // Chỉ gửi khi gọi refresh endpoint
  });
};

export const clearTokenCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh" });
};
```

> **Tại sao refresh_token có `path: '/api/v1/auth/refresh'`?**
> Refresh token chỉ cần gửi khi gọi endpoint refresh. Nếu `path: '/'`, mọi request đều gửi kèm refresh token → tăng bề mặt tấn công. Principle of Least Privilege.

#### ⚠️ Lỗi fresher hay mắc:

- **Lưu JWT ở LocalStorage:** Bất kỳ script nào (kể cả từ third-party ads) chạy trên page đều đọc được LocalStorage → đánh cắp token. HttpOnly Cookie = browser tự quản lý, JavaScript KHÔNG thể truy cập.
- **Không set `sameSite`:** Trang web khác có thể tạo form submit về API của em kèm theo cookie → CSRF attack.
- **JWT payload chứa password:** JWT chỉ encode Base64, KHÔNG encrypt. Ai cũng decode được. Chỉ lưu `userId`, `email`, `jti` (role lấy từ RBAC khi cần, không nhét thông tin nhạy cảm).

---

### Task 3.2: Viết Auth Validation & Types (1-2h)

#### `src/modules/auth/auth.validation.ts`:

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Cần ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Cần ít nhất 1 số")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt"),
  fullName: z
    .string()
    .min(2, "Tên tối thiểu 2 ký tự")
    .max(100, "Tên tối đa 100 ký tự")
    .trim(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

#### `src/middlewares/validate.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next({
          name: "ZodError",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};
```

#### ⚠️ Lỗi fresher hay mắc:

- **Validate ở Frontend, không validate ở Backend:** User có thể dùng Postman bypass toàn bộ validation phía client. Backend PHẢI validate lại.
- **Không `toLowerCase()` email:** `User@Gmail.com` và `user@gmail.com` là cùng 1 email nhưng hệ thống coi là 2 tài khoản khác nhau.

---

### Task 3.3: Viết Auth Service (3-4h)

#### `src/modules/auth/auth.service.ts`:

```typescript
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/token";
import { ApiError } from "@/utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.validation";

class AuthService {
  async register(data: RegisterInput) {
    // 1. Check email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw ApiError.conflict("Email này đã được đăng ký");
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 3. Lấy role mặc định CUSTOMER (User KHÔNG có cột role — quyền qua RBAC)
    const customerRole = await prisma.role.findUnique({
      where: { name: "CUSTOMER" },
    });
    if (!customerRole) {
      throw ApiError.internal("Chưa seed role CUSTOMER");
    }

    // 4. Tạo User + Profile + gán role CUSTOMER qua bảng UserRoles
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        profile: {
          create: {
            fullName: data.fullName,
            phoneNumber: data.phone,
          },
        },
        roles: {
          create: { roleId: customerRole.id },
        },
      },
      select: {
        id: true,
        email: true,
        profile: { select: { fullName: true } },
        createdAt: true,
      },
    });

    // 5. Tạo tokens
    const tokens = await this.generateTokenPair(user.id, user.email);

    return { user, ...tokens };
  }

  async login(data: LoginInput) {
    // 1. Tìm user (kèm profile để lấy fullName/avatar)
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true },
    });
    if (!user) {
      // Không nói "Email không tồn tại" → giúp attacker biết email nào đã đăng ký
      throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");
    }

    // 2. Check active
    if (!user.isActive) {
      throw ApiError.forbidden("Tài khoản đã bị khóa");
    }

    // 3. User OAuth (provider GOOGLE) không có password → không login bằng mật khẩu
    if (!user.password) {
      throw ApiError.unauthorized("Tài khoản này đăng nhập bằng Google");
    }

    // 4. So sánh password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");
    }

    // 5. Tạo tokens
    const tokens = await this.generateTokenPair(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        avatar: user.profile?.avatarUrl,
      },
      ...tokens,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    // 1. Verify token
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw ApiError.unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
    }

    // 2. Check token có trong DB không (chống token bị revoke)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });
    if (!storedToken) {
      // Token không có trong DB → có thể bị đánh cắp
      // Xóa TẤT CẢ refresh tokens của user này (force re-login mọi thiết bị)
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId },
      });
      throw ApiError.unauthorized("Refresh token đã bị thu hồi");
    }

    // 3. Xóa token cũ (Rotation: mỗi refresh token chỉ dùng 1 lần)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // 4. Tạo token pair mới
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Tài khoản không tồn tại hoặc đã bị khóa");
    }

    return this.generateTokenPair(user.id, user.email);
  }

  async logout(refreshToken: string) {
    // Xóa refresh token khỏi DB
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async logoutAllDevices(userId: string) {
    // Xóa TẤT CẢ refresh tokens → force re-login trên mọi thiết bị
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // ===== PRIVATE =====

  private async generateTokenPair(userId: string, email: string) {
    // jti định danh token cho rotation/revoke — nằm trong JWT, không lưu cột riêng
    const jti = randomUUID();
    const tokenPayload = { userId, email, jti };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Lưu refresh token vào DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Dọn dẹp tokens hết hạn (chạy mỗi lần login)
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
```

> **Refresh Token Rotation là gì?**
> Mỗi khi client dùng refresh token để lấy access token mới, server cấp **cả refresh token mới** và xóa refresh token cũ. Nếu attacker đánh cắp refresh token cũ và dùng trước nạn nhân → token cũ đã bị xóa → server phát hiện bất thường → xóa hết tokens → force re-login.

#### ⚠️ Lỗi fresher hay mắc:

- **Message lỗi khác nhau cho "email sai" và "password sai":** Attacker thử email random, nếu hệ thống nói "Email không tồn tại" → họ biết email nào ĐÃ đăng ký → dùng danh sách đó tấn công tiếp. Luôn trả "Email hoặc mật khẩu không đúng".
- **Không lưu refresh token ở DB:** Không thể revoke token khi user đổi password hoặc bị ban. Token vẫn valid cho đến khi hết hạn.
- **Trả password trong response:** `select: { password: false }` hoặc exclude password khỏi response. Prisma `select` chỉ trả các field em liệt kê.

---

### Task 3.4: Viết Auth Controller & Routes (2-3h)

#### `src/modules/auth/auth.controller.ts`:

```typescript
import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { authService } from "./auth.service";
import { setTokenCookies, clearTokenCookies } from "@/utils/cookie";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  setTokenCookies(res, result.accessToken, result.refreshToken);

  ApiResponse.created(res, result.user, "Đăng ký thành công");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  setTokenCookies(res, result.accessToken, result.refreshToken);

  ApiResponse.success(res, result.user, "Đăng nhập thành công");
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refresh_token;
    if (!oldRefreshToken) {
      throw new Error("No refresh token provided");
    }

    const tokens = await authService.refreshToken(oldRefreshToken);

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    ApiResponse.success(res, null, "Token refreshed");
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearTokenCookies(res);

  ApiResponse.success(res, null, "Đăng xuất thành công");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user được set bởi auth middleware (Task 3.5)
  ApiResponse.success(res, req.user);
});
```

#### `src/modules/auth/auth.routes.ts`:

```typescript
import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { registerSchema, loginSchema } from "./auth.validation";
import { isAuthenticated } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", isAuthenticated, authController.getMe);

export const authRoutes = router;
```

#### Đăng ký route trong `src/routes/index.ts`:

```typescript
import { authRoutes } from "@/modules/auth/auth.routes";

router.use("/auth", authRoutes);
```

---

### Task 3.5: Viết Auth & Authorization Middleware (3-4h)

#### `src/types/express.d.ts` — Extend Express Request:

```typescript
import { ROLE } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        avatarUrl: string | null;
        roles: ROLE[]; // User có nhiều role (RBAC)
      };
    }
  }
}
```

#### `src/middlewares/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/token";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";

export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Lấy token từ cookie (hoặc Authorization header cho mobile/Postman)
    const token =
      req.cookies.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw ApiError.unauthorized("Vui lòng đăng nhập");
    }

    // 2. Verify token
    const payload = verifyAccessToken(token);

    // 3. Kiểm tra user còn tồn tại và active không (kèm profile + roles)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        profile: { select: { fullName: true, avatarUrl: true } },
        roles: { select: { role: { select: { name: true } } } },
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Tài khoản không tồn tại hoặc đã bị khóa");
    }

    // 4. Gắn user vào request (roles là mảng tên role lấy từ RBAC)
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName ?? "",
      avatarUrl: user.profile?.avatarUrl ?? null,
      roles: user.roles.map((r) => r.role.name),
    };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(ApiError.unauthorized("Token không hợp lệ hoặc đã hết hạn"));
  }
};
```

#### `src/middlewares/role.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { ROLE } from "@prisma/client";
import { ApiError } from "@/utils/ApiError";

/**
 * Middleware kiểm tra role.
 * Dùng SAU isAuthenticated.
 *
 * Ví dụ:
 *   router.get('/admin', isAuthenticated, authorize('ADMIN'), adminController.dashboard)
 *   router.get('/seller', isAuthenticated, authorize('SELLER', 'ADMIN'), sellerController.dashboard)
 */
export const authorize = (...allowedRoles: ROLE[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập"));
    }

    // User có thể có NHIỀU role → chỉ cần 1 role nằm trong danh sách cho phép
    const isAllowed = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!isAllowed) {
      return next(
        ApiError.forbidden(
          `Roles "${req.user.roles.join(", ")}" không có quyền truy cập tài nguyên này`,
        ),
      );
    }

    next();
  };
};
```

> **Pattern `authorize('SELLER', 'ADMIN')`:**
> Admin có thể truy cập mọi thứ Seller thấy. Liệt kê explicit các role được phép → rõ ràng, dễ đọc, dễ debug.

#### ⚠️ Lỗi fresher hay mắc:

- **Chỉ bảo vệ route ở Frontend:** Em chặn user vào trang `/admin` bằng Next.js middleware. Nhưng user mở Postman gọi `GET /api/v1/admin/users` thì sao? Backend PHẢI có middleware riêng.
- **Không check `isActive` trong middleware:** Admin ban user rồi nhưng token vẫn valid → user vẫn truy cập được. Phải check lại DB mỗi request (hoặc dùng Redis cache).
- **Quên hỗ trợ Authorization header:** HttpOnly Cookie dùng cho web browser. Mobile app hoặc Postman không dùng cookie → cần fallback sang `Authorization: Bearer xxx`.

---

### Task 3.6: Viết Rate Limiting cho Auth APIs (1-2h)

```bash
npm install express-rate-limit
```

#### `src/middlewares/rateLimiter.middleware.ts`:

```typescript
import rateLimit from "express-rate-limit";

// Rate limit cho login — chống brute force
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần login sai per IP
  message: {
    success: false,
    message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Chỉ đếm request thất bại
});

// Rate limit chung cho API
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100, // 100 requests per phút per IP
  message: {
    success: false,
    message: "Quá nhiều request. Vui lòng thử lại sau.",
  },
});
```

#### Áp dụng vào auth routes:

```typescript
router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);
router.post(
  "/register",
  loginRateLimiter,
  validate(registerSchema),
  authController.register,
);
```

---

## 🏁 Checklist Cuối Phase 3

- [x] `POST /api/v1/auth/register` — tạo user mới, trả token trong cookie
- [x] `POST /api/v1/auth/login` — đăng nhập, trả token trong cookie
- [x] `POST /api/v1/auth/refresh` — refresh token rotation hoạt động
- [x] `POST /api/v1/auth/logout` — xóa cookie + xóa refresh token ở DB
- [x] `GET /api/v1/auth/me` — trả thông tin user hiện tại (cần auth)
- [x] Login sai 5 lần → bị rate limit 15 phút
- [x] User thường gọi API admin → 403 Forbidden
- [x] Password trong DB là bcrypt hash
- [x] JWT chỉ chứa `userId`, `email`, `jti` (không có password hay thông tin nhạy cảm)
- [x] Commit: "feat: JWT authentication with role-based authorization"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                   | Link                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| JWT Introduction         | https://jwt.io/introduction                                                    |
| OWASP Auth Cheat Sheet   | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html |
| HttpOnly Cookie Security | https://owasp.org/www-community/HttpOnly                                       |
| Refresh Token Rotation   | https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation     |
| express-rate-limit       | https://github.com/express-rate-limit/express-rate-limit                       |
