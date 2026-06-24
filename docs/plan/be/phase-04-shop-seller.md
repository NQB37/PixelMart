# 🏪 PHASE 4: Shop & Seller Module

> **Prerequisite:** Phase 3 hoàn thành (Auth + role USER, ADMIN).

---

## 🎯 MVP Của Phase Này

- User đăng ký trở thành Seller → role chuyển từ USER → SELLER
- Seller tạo được Shop với thông tin cơ bản (name, slug, description, logo)
- Admin approve/reject/suspend shop
- Middleware `isShopOwner` đảm bảo seller chỉ quản lý shop của mình
- API CRUD Shop profile

---

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta thêm role `SELLER` vào hệ thống và tạo bảng cửa hàng (`Shop`) thuộc về người dùng.

### 1. Cập nhật `prisma/schema.prisma`:
```prisma
// Cập nhật enum Role có thêm SELLER
enum Role {
  USER
  SELLER
  ADMIN
}

enum ShopStatus {
  PENDING    // Chờ admin approve
  ACTIVE     // Đang hoạt động
  SUSPENDED  // Bị khóa
}

// Cập nhật model User để liên kết với Shop
model User {
  // ... các trường cũ giữ nguyên
  role      Role      @default(USER)
  
  shop      Shop?     // Thêm quan hệ 1-1 với Shop
}

model Shop {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  logo        String?
  banner      String?
  ownerId     String     @unique  // 1 user = 1 shop
  owner       User       @relation(fields: [ownerId], references: [id])
  status      ShopStatus @default(PENDING)
  rating      Decimal    @default(0) @db.Decimal(2, 1) // 0.0 - 5.0
  isActive    Boolean    @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
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
import { PrismaClient, Role, ShopStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Phase 4...');
  const hashedPassword = await bcrypt.hash('Password@123', 12);

  // 1. Seed Seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller1@pixelmart.com' },
    update: {},
    create: {
      email: 'seller1@pixelmart.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn Seller',
      role: Role.SELLER,
    },
  });

  // 2. Seed Shop cho Seller này
  await prisma.shop.upsert({
    where: { slug: 'tech-store' },
    update: {},
    create: {
      name: 'Tech Store Official',
      slug: 'tech-store',
      description: 'Chuyên cung cấp các sản phẩm công nghệ chính hãng',
      ownerId: seller.id,
      status: ShopStatus.ACTIVE,
    },
  });

  console.log('✅ Seeding Phase 4 complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
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
import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(3, 'Tên shop tối thiểu 3 ký tự').max(100).trim(),
  description: z.string().max(1000).optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(1000).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
});

export const updateShopStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().optional(), // Lý do suspend
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
```

---

### Task 4.2: Shop Service (3-4h)

#### `src/modules/shop/shop.service.ts`:
```typescript
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/ApiError';
import { generateSlug } from '@/utils/generateSlug';
import { CreateShopInput, UpdateShopInput } from './shop.validation';
import { Role, ShopStatus } from '@prisma/client';

class ShopService {
  /**
   * User đăng ký mở shop → role chuyển thành SELLER
   */
  async createShop(userId: string, data: CreateShopInput) {
    // 1. Check user đã có shop chưa
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (existingShop) {
      throw ApiError.conflict('Bạn đã có shop. Mỗi tài khoản chỉ được tạo 1 shop.');
    }

    // 2. Tạo slug từ tên shop
    let slug = generateSlug(data.name);

    // 3. Check slug trùng → thêm random suffix
    const slugExists = await prisma.shop.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 4. Dùng transaction: tạo shop + cập nhật role user
    const shop = await prisma.$transaction(async (tx) => {
      // Tạo shop
      const newShop = await tx.shop.create({
        data: {
          ...data,
          slug,
          ownerId: userId,
          status: ShopStatus.PENDING, // Chờ admin approve
        },
      });

      // Cập nhật role user → SELLER
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.SELLER },
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
      throw ApiError.notFound('Bạn chưa có shop. Vui lòng đăng ký mở shop.');
    }

    return shop;
  }

  async getShopBySlug(slug: string) {
    const shop = await prisma.shop.findUnique({
      where: { slug, status: ShopStatus.ACTIVE },
      include: {
        owner: {
          select: { fullName: true, avatar: true, createdAt: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!shop) {
      throw ApiError.notFound('Shop không tồn tại');
    }

    return shop;
  }

  async updateShop(shopId: string, ownerId: string, data: UpdateShopInput) {
    // Verify ownership
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.ownerId !== ownerId) {
      throw ApiError.forbidden('Bạn không có quyền chỉnh sửa shop này');
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
          owner: { select: { fullName: true, email: true } },
          _count: { select: { products: true, orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async updateShopStatus(shopId: string, status: ShopStatus) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw ApiError.notFound('Shop không tồn tại');
    }

    return prisma.shop.update({
      where: { id: shopId },
      data: { status, isActive: status === ShopStatus.ACTIVE },
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
    .normalize('NFD')                   // Tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')    // Xóa dấu
    .replace(/đ/g, 'd')                 // Xử lý chữ đ
    .replace(/[^a-z0-9\s-]/g, '')       // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-')               // Thay space bằng -
    .replace(/-+/g, '-')                // Xóa - trùng
    .replace(/^-|-$/g, '');             // Xóa - đầu/cuối
};
```

> **Tại sao dùng Transaction khi tạo shop?**
> Hai thao tác phải thành công CÙNG LÚC: (1) tạo shop, (2) đổi role thành SELLER. Nếu tạo shop thành công nhưng đổi role thất bại → user không có quyền seller nhưng có shop ảo. Transaction đảm bảo: hoặc cả hai thành công, hoặc rollback cả hai.

#### ⚠️ Lỗi fresher hay mắc:
- **Không handle slug tiếng Việt:** "Cửa hàng Phát Đạt" phải thành `cua-hang-phat-dat`, không phải lỗi encoding.
- **Cho phép seller tự approve shop:** Shop mới phải ở trạng thái PENDING cho admin review. Nếu ai cũng tự ACTIVE thì không kiểm soát được quality.
- **Không verify shop ownership:** Seller A sửa shop B bằng cách đổi shopId trong request → phải luôn check `shop.ownerId === req.user.id`.

---

### Task 4.3: Shop Controller & Routes (2-3h)

#### `src/modules/shop/shop.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { shopService } from './shop.service';
import { ShopStatus } from '@prisma/client';

// === SELLER ROUTES ===

export const createShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.createShop(req.user!.id, req.body);
  ApiResponse.created(res, shop, 'Đăng ký shop thành công! Vui lòng chờ admin phê duyệt.');
});

export const getMyShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.getMyShop(req.user!.id);
  ApiResponse.success(res, shop);
});

export const updateMyShop = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.getMyShop(req.user!.id);
  const updatedShop = await shopService.updateShop(shop.id, req.user!.id, req.body);
  ApiResponse.success(res, updatedShop, 'Cập nhật shop thành công');
});

// === PUBLIC ROUTES ===

export const getShopBySlug = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.getShopBySlug(req.params.slug);
  ApiResponse.success(res, shop);
});

// === ADMIN ROUTES ===

export const getAllShops = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as ShopStatus | undefined;
  const result = await shopService.getAllShops(page, limit, status);
  ApiResponse.success(res, result);
});

export const updateShopStatus = asyncHandler(async (req: Request, res: Response) => {
  const shop = await shopService.updateShopStatus(req.params.id, req.body.status);
  ApiResponse.success(res, shop, `Shop đã được ${req.body.status === 'ACTIVE' ? 'phê duyệt' : 'tạm khóa'}`);
});
```

#### `src/modules/shop/shop.routes.ts`:
```typescript
import { Router } from 'express';
import * as shopController from './shop.controller';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/role.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { createShopSchema, updateShopSchema, updateShopStatusSchema } from './shop.validation';

const router = Router();

// Public
router.get('/:slug', shopController.getShopBySlug);

// Seller (đã đăng nhập)
router.post('/', isAuthenticated, validate(createShopSchema), shopController.createShop);
router.get('/me/dashboard', isAuthenticated, authorize('SELLER', 'ADMIN'), shopController.getMyShop);
router.put('/me', isAuthenticated, authorize('SELLER', 'ADMIN'), validate(updateShopSchema), shopController.updateMyShop);

// Admin
router.get('/', isAuthenticated, authorize('ADMIN'), shopController.getAllShops);
router.patch('/:id/status', isAuthenticated, authorize('ADMIN'), validate(updateShopStatusSchema), shopController.updateShopStatus);

export const shopRoutes = router;
```

---

### Task 4.4: Shop Owner Middleware (1h)

#### `src/middlewares/shopOwner.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/ApiError';

/**
 * Middleware kiểm tra seller có sở hữu shop đang thao tác không.
 * Dùng cho các route cần shopId (vd: thêm/sửa product của shop).
 * 
 * Gắn shop vào req để controller dùng: req.shop
 */
export const isShopOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Vui lòng đăng nhập');
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!shop) {
      throw ApiError.notFound('Bạn chưa có shop. Vui lòng đăng ký mở shop.');
    }

    if (shop.status !== 'ACTIVE') {
      throw ApiError.forbidden('Shop chưa được phê duyệt hoặc đã bị tạm khóa');
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

- [ ] `POST /api/v1/shops` — User tạo shop, role chuyển thành SELLER
- [ ] `GET /api/v1/shops/me/dashboard` — Seller xem dashboard shop mình
- [ ] `PUT /api/v1/shops/me` — Seller cập nhật thông tin shop
- [ ] `GET /api/v1/shops/:slug` — Public xem trang shop
- [ ] `GET /api/v1/shops` — Admin xem danh sách tất cả shops
- [ ] `PATCH /api/v1/shops/:id/status` — Admin approve/suspend shop
- [ ] Slug tiếng Việt hoạt động đúng ("Phát Đạt" → "phat-dat")
- [ ] Transaction đảm bảo tạo shop + đổi role atomic
- [ ] Shop mới có status PENDING (không tự ACTIVE)
- [ ] Commit: "feat: shop/seller module with admin approval flow"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề | Link |
|---|---|
| Prisma Transactions | https://www.prisma.io/docs/concepts/components/prisma-client/transactions |
| URL Slug Best Practices | https://moz.com/learn/seo/url |
| Marketplace Seller Onboarding | https://www.sharetribe.com/academy/how-to-build-a-marketplace/ |
