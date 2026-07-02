# 🏪 PHASE 4: Shop & Seller Module

> **Prerequisite:** Phase 3 hoàn thành (Auth + RBAC: role CUSTOMER, ADMIN).

---

## 🎯 MVP Của Phase Này

- User đăng ký trở thành Seller → được gán thêm role `SELLER` (qua bảng `UserRoles`)
- Seller tạo được Shop với thông tin cơ bản (shopName, logoUrl)
- Admin duyệt (`approvalStatus`: APPROVED/REJECTED) và khóa/mở (`status`: ACTIVE/SUSPENDED) shop
- Middleware `isShopOwner` đảm bảo seller chỉ quản lý shop của mình
- API CRUD Shop profile

---

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta dùng role `SELLER` đã có sẵn trong RBAC (enum `ROLE`) và tạo bảng cửa hàng (`Shop`) thuộc về người dùng.

### 1. Cập nhật `prisma/schema.prisma`:

```prisma
// enum ROLE đã có sẵn từ Phase 3 (RBAC): CUSTOMER, SELLER, ADMIN, DELIVERY_PERSON
// Seller = user được gán thêm role SELLER qua bảng UserRoles (không có cột role trên User).

// Admin duyệt shop (tách khỏi trạng thái vận hành)
enum ApprovalStatus {
  PENDING    // Chờ admin duyệt
  APPROVED   // Đã duyệt
  REJECTED   // Bị từ chối
}

// Trạng thái vận hành của shop
enum ShopStatus {
  ACTIVE     // Đang hoạt động
  SUSPENDED  // Bị tạm khóa
  INACTIVE   // Ngừng hoạt động
}

// Cập nhật model User để liên kết với Shop
model User {
  // ... các trường cũ giữ nguyên (role lấy qua quan hệ roles UserRoles[])
  shop      Shop?     // Thêm quan hệ 1-1 với Shop
}

model Shop {
  id             String         @id @default(uuid())
  ownerId        String         @unique  // 1 user = 1 shop
  shopName       String
  logoUrl        String?
  rating         Float          @default(0) // 0.0 - 5.0
  approvalStatus ApprovalStatus @default(PENDING) // admin duyệt
  rejectedReason String?
  status         ShopStatus     @default(ACTIVE)  // trạng thái vận hành
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?       // soft delete

  user User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@map("shops")
}
```

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name add_shop
```

### 3. Viết Seed Data Cho `prisma/seed.ts`:

Cập nhật file `prisma/seed.ts` để seed thêm tài khoản Seller và Shop:

```typescript
import { PrismaClient, ROLE, ShopStatus, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Phase 4...");
  const hashedPassword = await bcrypt.hash("Password@123", 12);

  // Role SELLER đã được seed ở Phase 3 (RBAC)
  const sellerRole = await prisma.role.findUniqueOrThrow({
    where: { name: ROLE.SELLER },
  });

  // 1. Seed Seller — thông tin cá nhân nằm ở Profile, role gán qua UserRoles
  const seller = await prisma.user.upsert({
    where: { email: "seller1@pixelmart.com" },
    update: {},
    create: {
      email: "seller1@pixelmart.com",
      password: hashedPassword,
      profile: {
        create: { fullName: "Nguyễn Văn Seller" },
      },
      roles: {
        create: { roleId: sellerRole.id },
      },
    },
  });

  // 2. Seed Shop cho Seller này
  await prisma.shop.upsert({
    where: { ownerId: seller.id },
    update: {},
    create: {
      shopName: "Tech Store Official",
      ownerId: seller.id,
      approvalStatus: ApprovalStatus.APPROVED,
      status: ShopStatus.ACTIVE,
    },
  });

  console.log("✅ Seeding Phase 4 complete!");
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

Chạy lệnh seed:

```bash
npx prisma db seed
```

---

## 📋 Task Breakdown

### Task 4.1: Shop Validation & Types (1h)

#### `src/modules/shop/shop.validation.ts`:

```typescript
import { z } from "zod";

export const createShopSchema = z.object({
  shopName: z.string().min(3, "Tên shop tối thiểu 3 ký tự").max(100).trim(),
});

export const updateShopSchema = z.object({
  shopName: z.string().min(3).max(100).trim().optional(),
  logoUrl: z.string().url().optional(),
});

// Admin duyệt shop: PENDING → APPROVED/REJECTED
export const reviewShopSchema = z.object({
  approvalStatus: z.enum(["APPROVED", "REJECTED"]),
  rejectedReason: z.string().optional(), // Bắt buộc khi REJECTED
});

// Admin đổi trạng thái vận hành
export const updateShopStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ReviewShopInput = z.infer<typeof reviewShopSchema>;
```

---

### Task 4.2: Shop Service (3-4h)

#### `src/modules/shop/shop.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { CreateShopInput, UpdateShopInput, ReviewShopInput } from "./shop.validation";
import { ROLE, ShopStatus, ApprovalStatus } from "@prisma/client";

class ShopService {
  /**
   * User đăng ký mở shop → được gán thêm role SELLER (RBAC)
   */
  async createShop(userId: string, data: CreateShopInput) {
    // 1. Check user đã có shop chưa
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (existingShop) {
      throw ApiError.conflict(
        "Bạn đã có shop. Mỗi tài khoản chỉ được tạo 1 shop.",
      );
    }

    // 2. Lấy role SELLER (đã seed ở Phase 3)
    const sellerRole = await prisma.role.findUniqueOrThrow({
      where: { name: ROLE.SELLER },
    });

    // 3. Dùng transaction: tạo shop + gán role SELLER cho user
    const shop = await prisma.$transaction(async (tx) => {
      // Tạo shop (approvalStatus mặc định PENDING → chờ admin duyệt)
      const newShop = await tx.shop.create({
        data: {
          ...data,
          ownerId: userId,
        },
      });

      // Gán role SELLER cho user (bỏ qua nếu đã có)
      await tx.userRoles.upsert({
        where: { userId_roleId: { userId, roleId: sellerRole.id } },
        update: {},
        create: { userId, roleId: sellerRole.id },
      });

      return newShop;
    });

    return shop;
  }

  async getMyShop(userId: string) {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!shop) {
      throw ApiError.notFound("Bạn chưa có shop. Vui lòng đăng ký mở shop.");
    }

    return shop;
  }

  async getShopById(id: string) {
    const shop = await prisma.shop.findFirst({
      where: {
        id,
        status: ShopStatus.ACTIVE,
        approvalStatus: ApprovalStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            createdAt: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!shop) {
      throw ApiError.notFound("Shop không tồn tại");
    }

    return shop;
  }

  async updateShop(shopId: string, ownerId: string, data: UpdateShopInput) {
    // Verify ownership
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.ownerId !== ownerId) {
      throw ApiError.forbidden("Bạn không có quyền chỉnh sửa shop này");
    }

    return prisma.shop.update({
      where: { id: shopId },
      data,
    });
  }

  // ===== ADMIN ONLY =====

  async getAllShops(page = 1, limit = 20, status?: ShopStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          _count: { select: { products: true, orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shop.count({ where }),
    ]);

    return {
      shops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Duyệt / từ chối shop (approvalStatus — tách khỏi trạng thái vận hành)
  async reviewShop(shopId: string, data: ReviewShopInput) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw ApiError.notFound("Shop không tồn tại");
    }

    return prisma.shop.update({
      where: { id: shopId },
      data: {
        approvalStatus: data.approvalStatus,
        rejectedReason:
          data.approvalStatus === ApprovalStatus.REJECTED
            ? data.rejectedReason
            : null,
      },
    });
  }

  // Khóa / mở shop (status vận hành)
  async updateShopStatus(shopId: string, status: ShopStatus) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw ApiError.notFound("Shop không tồn tại");
    }

    return prisma.shop.update({
      where: { id: shopId },
      data: { status },
    });
  }
}

export const shopService = new ShopService();
```

#### `src/utils/generateSlug.ts`:

```typescript
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD") // Tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d") // Xử lý chữ đ
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay space bằng -
    .replace(/-+/g, "-") // Xóa - trùng
    .replace(/^-|-$/g, ""); // Xóa - đầu/cuối
};
```

> **Tại sao dùng Transaction khi tạo shop?**
> Hai thao tác phải thành công CÙNG LÚC: (1) tạo shop, (2) gán role SELLER cho user (bản ghi trong `UserRoles`). Nếu tạo shop thành công nhưng gán role thất bại → user không có quyền seller nhưng có shop ảo. Transaction đảm bảo: hoặc cả hai thành công, hoặc rollback cả hai.

> **Lưu ý:** `generateSlug` ở trên dùng cho `Product`/`Category` (các model có `slug`) ở phase sau. `Shop` **không** có slug — trang shop định danh bằng `id`.

#### ⚠️ Lỗi fresher hay mắc:

- **Cho phép seller tự duyệt shop:** Shop mới phải ở `approvalStatus = PENDING` cho admin review. Nếu ai cũng tự APPROVED thì không kiểm soát được quality.
- **Không verify shop ownership:** Seller A sửa shop B bằng cách đổi shopId trong request → phải luôn check `shop.ownerId === req.user.id`.

---

### Task 4.3: Shop Controller & Routes (2-3h)

#### `src/modules/shop/shop.controller.ts`:

```typescript
import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { shopService } from "./shop.service";
import { ShopStatus } from "@prisma/client";

// === SELLER ROUTES ===

export const createShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.createShop(req.user!.id, req.body);
  ApiResponse.created(
    res,
    shop,
    "Đăng ký shop thành công! Vui lòng chờ admin phê duyệt.",
  );
});

export const getMyShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.getMyShop(req.user!.id);
  ApiResponse.success(res, shop);
});

export const updateMyShop = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = await shopService.getMyShop(req.user!.id);
    const updatedShop = await shopService.updateShop(
      shop.id,
      req.user!.id,
      req.body,
    );
    ApiResponse.success(res, updatedShop, "Cập nhật shop thành công");
  },
);

// === PUBLIC ROUTES ===

export const getShopById = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = await shopService.getShopById(req.params.id);
    ApiResponse.success(res, shop);
  },
);

// === ADMIN ROUTES ===

export const getAllShops = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as ShopStatus | undefined;
  const result = await shopService.getAllShops(page, limit, status);
  ApiResponse.success(res, result);
});

export const reviewShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.reviewShop(req.params.id, req.body);
  ApiResponse.success(
    res,
    shop,
    `Shop đã được ${req.body.approvalStatus === "APPROVED" ? "phê duyệt" : "từ chối"}`,
  );
});

export const updateShopStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = await shopService.updateShopStatus(
      req.params.id,
      req.body.status,
    );
    ApiResponse.success(
      res,
      shop,
      `Shop đã được ${req.body.status === "ACTIVE" ? "mở lại" : "tạm khóa"}`,
    );
  },
);
```

#### `src/modules/shop/shop.routes.ts`:

```typescript
import { Router } from "express";
import * as shopController from "./shop.controller";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import {
  createShopSchema,
  updateShopSchema,
  reviewShopSchema,
  updateShopStatusSchema,
} from "./shop.validation";

const router = Router();

// Public
router.get("/:id", shopController.getShopById);

// Seller (đã đăng nhập)
router.post(
  "/",
  isAuthenticated,
  validate(createShopSchema),
  shopController.createShop,
);
router.get(
  "/me/dashboard",
  isAuthenticated,
  authorize("SELLER", "ADMIN"),
  shopController.getMyShop,
);
router.put(
  "/me",
  isAuthenticated,
  authorize("SELLER", "ADMIN"),
  validate(updateShopSchema),
  shopController.updateMyShop,
);

// Admin
router.get(
  "/",
  isAuthenticated,
  authorize("ADMIN"),
  shopController.getAllShops,
);
router.patch(
  "/:id/review",
  isAuthenticated,
  authorize("ADMIN"),
  validate(reviewShopSchema),
  shopController.reviewShop,
);
router.patch(
  "/:id/status",
  isAuthenticated,
  authorize("ADMIN"),
  validate(updateShopStatusSchema),
  shopController.updateShopStatus,
);

export const shopRoutes = router;
```

---

### Task 4.4: Shop Owner Middleware (1h)

#### `src/middlewares/shopOwner.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";

/**
 * Middleware kiểm tra seller có sở hữu shop đang thao tác không.
 * Dùng cho các route cần shopId (vd: thêm/sửa product của shop).
 *
 * Gắn shop vào req để controller dùng: req.shop
 */
export const isShopOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("Vui lòng đăng nhập");
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!shop) {
      throw ApiError.notFound("Bạn chưa có shop. Vui lòng đăng ký mở shop.");
    }

    if (shop.approvalStatus !== "APPROVED" || shop.status !== "ACTIVE") {
      throw ApiError.forbidden("Shop chưa được phê duyệt hoặc đã bị tạm khóa");
    }

    // Gắn shop vào request để dùng ở controller
    (req as any).shop = shop;
    next();
  } catch (error) {
    next(error);
  }
};
```

> Middleware này sẽ dùng nhiều ở Phase 5 (Product Management) — seller thêm/sửa/xóa sản phẩm của shop mình.

---

## 🏁 Checklist Cuối Phase 4

- [ ] `POST /api/v1/shops` — User tạo shop, được gán thêm role SELLER
- [ ] `GET /api/v1/shops/me/dashboard` — Seller xem dashboard shop mình
- [ ] `PUT /api/v1/shops/me` — Seller cập nhật thông tin shop
- [ ] `GET /api/v1/shops/:id` — Public xem trang shop
- [ ] `GET /api/v1/shops` — Admin xem danh sách tất cả shops
- [ ] `PATCH /api/v1/shops/:id/review` — Admin approve/reject shop (approvalStatus)
- [ ] `PATCH /api/v1/shops/:id/status` — Admin suspend/mở lại shop (status)
- [ ] Transaction đảm bảo tạo shop + gán role SELLER atomic
- [ ] Shop mới có approvalStatus PENDING (chờ duyệt)
- [ ] Commit: "feat: shop/seller module with admin approval flow"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                        | Link                                                                      |
| ----------------------------- | ------------------------------------------------------------------------- |
| Prisma Transactions           | https://www.prisma.io/docs/concepts/components/prisma-client/transactions |
| URL Slug Best Practices       | https://moz.com/learn/seo/url                                             |
| Marketplace Seller Onboarding | https://www.sharetribe.com/academy/how-to-build-a-marketplace/            |
