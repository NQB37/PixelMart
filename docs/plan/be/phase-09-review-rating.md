# ⭐ PHASE 9: Review & Rating System

> **Prerequisite:** Phase 8 hoàn thành.

---

## 🎯 MVP Của Phase Này

- Buyer chỉ review được khi đã mua hàng (order DELIVERED)
- Rating 1-5 sao + comment + upload ảnh review
- Mỗi user chỉ review 1 lần per product per order
- API lấy danh sách reviews trên sản phẩm (phân trang, lấy trung bình rating, phân bố 1-5 sao)
- Shop rating = trung bình rating tất cả sản phẩm

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo bảng đánh giá sản phẩm (`Review`) liên kết giữa sản phẩm, người dùng và đơn hàng để đảm bảo tính xác thực của đánh giá.

### 1. Thêm Vào `prisma/schema.prisma`:

```prisma
model Review {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  orderId   String  // Đơn hàng mua sản phẩm này

  rating    Int     // Điểm đánh giá: 1 - 5
  comment   String? @db.Text
  images    Json    @default("[]") // Lưu mảng URLs ảnh đánh giá dưới dạng JSON array

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId, orderId]) // Tránh spam đánh giá nhiều lần cho 1 đơn hàng
  @@index([productId])
  @@index([userId])
  @@map("reviews")
}
```

Hãy nhớ cập nhật liên kết trong các model cũ:

- Trong `User`: `reviews Review[]`
- Trong `Product`: `reviews Review[]`

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name add_reviews
```

> [!NOTE]
> Review được sinh ra hoàn toàn do Buyer thực tế sau khi mua hàng. Chúng ta không cần viết seed data cho Review trong file `seed.ts` ở môi trường Dev.

---

## 📋 Task Breakdown

### Task 9.1: Review Service (3-4h)

#### `src/modules/review/review.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { Prisma } from "@prisma/client";

class ReviewService {
  async createReview(
    userId: string,
    data: {
      productId: string;
      orderId: string;
      rating: number;
      comment?: string;
      images?: string[];
    },
  ) {
    // 1. Validate: user đã mua hàng và đơn đã delivered
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          id: data.orderId,
          userId,
          status: "DELIVERED",
        },
      },
    });
    if (!orderItem) {
      throw ApiError.forbidden(
        "Bạn chỉ có thể đánh giá sản phẩm đã mua và đã nhận hàng",
      );
    }

    // 2. Check đã review chưa (1 user, 1 product, 1 order)
    const existing = await prisma.review.findUnique({
      where: {
        userId_productId_orderId: {
          userId,
          productId: data.productId,
          orderId: data.orderId,
        },
      },
    });
    if (existing) {
      throw ApiError.conflict("Bạn đã đánh giá sản phẩm này cho đơn hàng này");
    }

    // 3. Tạo review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        orderId: data.orderId,
        rating: data.rating,
        comment: data.comment,
        images: data.images || [],
      },
      include: {
        user: { select: { fullName: true, avatar: true } },
      },
    });

    // 4. Cập nhật shop rating (async, không block response)
    this.updateShopRating(data.productId).catch(console.error);

    return review;
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { fullName: true, avatar: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { productId } }),
      this.getReviewStats(productId),
    ]);

    return {
      reviews,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReviewStats(productId: string) {
    const [aggregate, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      // Phân bố rating: bao nhiêu 5 sao, 4 sao, ...
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId },
        _count: { rating: true },
        orderBy: { rating: "desc" },
      }),
    ]);

    const ratingDistribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    for (const d of distribution) {
      ratingDistribution[d.rating] = d._count.rating;
    }

    return {
      average: aggregate._avg.rating || 0,
      total: aggregate._count.rating,
      distribution: ratingDistribution,
    };
  }

  private async updateShopRating(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { shopId: true },
    });
    if (!product) return;

    const shopAvg = await prisma.review.aggregate({
      where: { product: { shopId: product.shopId } },
      _avg: { rating: true },
    });

    await prisma.shop.update({
      where: { id: product.shopId },
      data: { rating: shopAvg._avg.rating || 0 },
    });
  }
}

export const reviewService = new ReviewService();
```

#### ⚠️ Lỗi fresher hay mắc:

- **Cho phép review mà không mua:** Ai cũng spam 5-sao cho shop mình, 1-sao cho đối thủ. Bắt buộc verify order + DELIVERED.
- **Rating trung bình tính sai:** Dùng `AVG()` trên toàn bộ reviews là đúng. Nhưng fresher hay tính `(sum / count)` thủ công, quên xử lý khi count = 0 → chia cho 0.
- **updateShopRating block response:** Tính toán aggregate trên hàng ngàn reviews tốn thời gian. Dùng async fire-and-forget hoặc scheduled job.

### Task 9.2: Review Validation (1h)

```typescript
import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  orderId: z.string().cuid(),
  rating: z
    .number()
    .int()
    .min(1, "Rating tối thiểu 1")
    .max(5, "Rating tối đa 5"),
  comment: z.string().max(1000, "Comment tối đa 1000 ký tự").optional(),
  images: z.array(z.string().url()).max(5, "Tối đa 5 ảnh").optional(),
});
```

### Task 9.3: Review Routes (1h)

```typescript
// POST   /api/v1/reviews              — Tạo review (buyer, cần auth)
// GET    /api/v1/reviews/product/:id   — Lấy reviews của product (public)
// GET    /api/v1/reviews/stats/:id     — Thống kê rating (public)
// GET    /api/v1/reviews/my            — Reviews của tôi (buyer)
```

## 🏁 Checklist Cuối Phase 9

- [ ] Review chỉ tạo được khi order DELIVERED
- [ ] 1 user/1 product/1 order chỉ review 1 lần
- [ ] Rating stats: average + distribution hiển thị đúng
- [ ] Shop rating auto-update khi có review mới
- [ ] Review images upload hoạt động
- [ ] Phân trang reviews
- [ ] Commit: "feat: review and rating system with purchase verification"
