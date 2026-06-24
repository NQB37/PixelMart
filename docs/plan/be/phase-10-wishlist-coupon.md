# ❤️🎟️ PHASE 10: Wishlist & Coupon System

> **Prerequisite:** Phase 8 hoàn thành.

---

## 🎯 MVP Của Phase Này

**Wishlist:**
- API toggle yêu thích sản phẩm
- API lấy danh sách sản phẩm yêu thích (lọc bỏ sản phẩm inactive)
- Xóa item từ wishlist

**Coupon:**
- Seller tạo/quản lý coupon cho shop mình qua API
- Admin tạo coupon platform (toàn sàn)
- API validate và áp dụng coupon ở checkout
- Coupon rules: min order value, max discount, usage limit, date range

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo bảng quản lý danh sách yêu thích (`Wishlist`) và bảng quản lý mã giảm giá (`Coupon`) cho cả shop và platform.

### 1. Thêm Vào `prisma/schema.prisma`:
```prisma
enum CouponType {
  PERCENTAGE   // Giảm theo % (ví dụ: 10%)
  FIXED_AMOUNT // Giảm theo số tiền cố định (ví dụ: 50.000₫)
}

model Wishlist {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, productId]) // Một user chỉ thích sản phẩm này tối đa 1 lần
  @@index([userId])
  @@map("wishlists")
}

model Coupon {
  id           String     @id @default(cuid())
  code         String     @unique
  shopId       String?    // null = platform coupon (admin tạo), có id = shop coupon (seller tạo)
  shop         Shop?      @relation(fields: [shopId], references: [id])
  type         CouponType
  value        Decimal    @db.Decimal(12, 2)
  minOrderValue Decimal?  @db.Decimal(12, 2)
  maxDiscount  Decimal?   @db.Decimal(12, 2) // Giảm tối đa (hữu ích cho loại PERCENTAGE)
  usageLimit   Int?       // null = không giới hạn số lần sử dụng
  usedCount    Int        @default(0)
  startDate    DateTime
  endDate      DateTime
  isActive     Boolean    @default(true)

  orders Order[] // Các đơn hàng đã áp dụng coupon này

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([shopId])
  @@map("coupons")
}
```

Đồng thời cập nhật trường `couponId` và quan hệ coupon trong model `Order` cũ để liên kết với Coupon:
```prisma
model Order {
  // ... các trường cũ giữ nguyên
  couponId      String?
  coupon        Coupon?       @relation(fields: [couponId], references: [id])
}
```

Và các liên kết trong các model cũ khác:
- Trong `User`: `wishlistItems Wishlist[]`
- Trong `Product`: `wishlistItems Wishlist[]`
- Trong `Shop`: `coupons Coupon[]`

### 2. Chạy Migration:
```bash
npx prisma migrate dev --name add_wishlist_coupon
```

### 3. Viết Seed Data Cho `prisma/seed.ts`:
Cập nhật file `prisma/seed.ts` để tạo một platform coupon và một shop coupon làm dữ liệu test:
```typescript
import { PrismaClient, ShopStatus, CouponType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Phase 10...');

  // 1. Lấy shop đã có
  const shop = await prisma.shop.findUnique({
    where: { slug: 'tech-store' },
  });

  if (!shop) {
    console.log('⚠️ Không tìm thấy Shop để seed Coupon!');
    return;
  }

  // 2. Seed platform coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      shopId: null, // Platform coupon
      type: CouponType.PERCENTAGE,
      value: 10,
      minOrderValue: 500000,
      maxDiscount: 100000,
      usageLimit: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
    },
  });

  // 3. Seed shop coupon
  await prisma.coupon.upsert({
    where: { code: 'TECHSTORE50K' },
    update: {},
    create: {
      code: 'TECHSTORE50K',
      shopId: shop.id, // Coupon của shop
      type: CouponType.FIXED_AMOUNT,
      value: 50000,
      minOrderValue: 1000000,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    },
  });

  console.log('✅ Seeding Phase 10 complete!');
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

Chạy seed:
```bash
npx prisma db seed
```

---

## 📋 Task Breakdown

### Task 10.1: Wishlist — Simple Toggle (2-3h)

#### `src/modules/wishlist/wishlist.service.ts`:
```typescript
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/ApiError';

class WishlistService {
  async toggle(userId: string, productId: string) {
    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
    });
    if (!product) throw ApiError.notFound('Sản phẩm không tồn tại');

    // Check if already wishlisted
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return { wishlisted: false, message: 'Đã bỏ yêu thích' };
    }

    // Add to wishlist
    await prisma.wishlist.create({ data: { userId, productId } });
    return { wishlisted: true, message: 'Đã thêm vào yêu thích' };
  }

  async getMyWishlist(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, price: true, comparePrice: true,
              stock: true, isActive: true,
              images: { where: { isPrimary: true }, take: 1 },
              shop: { select: { name: true, slug: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wishlist.count({ where: { userId } }),
    ]);

    return {
      items: items.filter((i) => i.product.isActive), // Filter SP đã bị ẩn
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async isWishlisted(userId: string, productId: string) {
    const item = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }
}

export const wishlistService = new WishlistService();
```

```typescript
// Routes:
// POST /api/v1/wishlist/:productId   — Toggle wishlist
// GET  /api/v1/wishlist              — Lấy danh sách wishlist
// GET  /api/v1/wishlist/check/:productId — Check SP đã wishlisted chưa
```

---

### Task 10.2: Coupon CRUD — Seller & Admin (3-4h)

#### `src/modules/coupon/coupon.validation.ts`:
```typescript
import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3).max(20)
    .transform((v) => v.toUpperCase().trim())
    .refine((v) => /^[A-Z0-9]+$/.test(v), 'Mã chỉ chứa chữ hoa và số'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive('Giá trị phải lớn hơn 0'),
  minOrderValue: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }
).refine(
  (data) => !(data.type === 'PERCENTAGE' && data.value > 100),
  { message: 'Phần trăm giảm không được vượt 100%', path: ['value'] }
);
```

#### `src/modules/coupon/coupon.service.ts`:
```typescript
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/ApiError';
import { Prisma } from '@prisma/client';

class CouponService {
  // === SELLER / ADMIN: CRUD ===

  async createCoupon(data: any, shopId?: string) {
    // Check code trùng
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) throw ApiError.conflict(`Mã "${data.code}" đã tồn tại`);

    return prisma.coupon.create({
      data: { ...data, shopId: shopId || null },
    });
  }

  async getShopCoupons(shopId: string) {
    return prisma.coupon.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCoupon(couponId: string, shopId: string, data: any) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon || coupon.shopId !== shopId) {
      throw ApiError.forbidden('Bạn không có quyền sửa mã này');
    }
    return prisma.coupon.update({ where: { id: couponId }, data });
  }

  async deleteCoupon(couponId: string, shopId: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon || coupon.shopId !== shopId) {
      throw ApiError.forbidden('Bạn không có quyền xóa mã này');
    }
    return prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
  }

  // === BUYER: VALIDATE & APPLY ===

  /**
   * Validate coupon code trước khi apply
   * Trả về thông tin coupon + số tiền giảm dự kiến
   */
  async validateCoupon(code: string, orderSubtotal: number, shopId?: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw ApiError.notFound('Mã giảm giá không tồn tại hoặc đã bị vô hiệu');
    }

    // Check date range
    const now = new Date();
    if (now < coupon.startDate) {
      throw ApiError.badRequest('Mã giảm giá chưa đến thời gian sử dụng');
    }
    if (now > coupon.endDate) {
      throw ApiError.badRequest('Mã giảm giá đã hết hạn');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('Mã giảm giá đã hết lượt sử dụng');
    }

    // Check shop coupon vs order shop
    if (coupon.shopId && shopId && coupon.shopId !== shopId) {
      throw ApiError.badRequest('Mã giảm giá không áp dụng cho shop này');
    }

    // Check min order value
    if (coupon.minOrderValue && orderSubtotal < Number(coupon.minOrderValue)) {
      throw ApiError.badRequest(
        `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(Number(coupon.minOrderValue))}₫ để sử dụng mã này`
      );
    }

    // Calculate discount
    let discount: number;
    if (coupon.type === 'PERCENTAGE') {
      discount = orderSubtotal * (Number(coupon.value) / 100);
      // Cap at maxDiscount
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.value);
    }

    // Discount không vượt subtotal
    discount = Math.min(discount, orderSubtotal);

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount: Math.round(discount), // Làm tròn
    };
  }

  /**
   * Apply coupon vào order (increment usedCount)
   * Gọi trong checkout transaction
   */
  async applyCoupon(couponId: string) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }
}

export const couponService = new CouponService();
```

#### ⚠️ Lỗi fresher hay mắc:
- **Validate coupon ở client, không validate ở server:** User sửa request body → giảm giá 100% → mua free. Server PHẢI validate lại.
- **Race condition với `usageLimit`:** 100 users cùng dùng coupon có limit = 1. Phải check + increment trong transaction hoặc dùng atomic update.
- **Coupon của shop A dùng cho order của shop B:** Phải check `coupon.shopId === order.shopId` (nếu là shop coupon).
- **Không round số tiền giảm:** `10% × 999.999 = 99.9999` → hiện số lẻ xấu. Round trước khi lưu.

---

### Task 10.3: Tích hợp Coupon vào Checkout (2-3h)

Cập nhật Order Service checkout flow:

```typescript
// Trong checkout function, trước khi tạo order:
let discount = new Prisma.Decimal(0);
let couponId: string | undefined;

if (input.couponCode) {
  const couponResult = await couponService.validateCoupon(
    input.couponCode,
    Number(subtotal),
    shopId
  );
  discount = new Prisma.Decimal(couponResult.discount);
  couponId = couponResult.coupon.id;
}

// Sau khi tạo order thành công:
if (couponId) {
  await couponService.applyCoupon(couponId);
}
```

## 🏁 Checklist Cuối Phase 10

- [ ] Toggle wishlist (add/remove) hoạt động
- [ ] API wishlist hoạt động, filter/ẩn sản phẩm inactive
- [ ] Seller CRUD coupon cho shop mình
- [ ] Admin CRUD coupon platform
- [ ] Validate coupon: date, usage, min order, shop match
- [ ] Apply coupon giảm giá đúng (percentage + fixed)
- [ ] maxDiscount cap hoạt động cho percentage coupon
- [ ] usedCount increment atomic
- [ ] Coupon tích hợp vào checkout flow
- [ ] Commit: "feat: wishlist toggle and coupon system with checkout integration"
