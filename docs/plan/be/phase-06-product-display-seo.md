# 🔍 PHASE 6: Product Display, Search & SEO — Buyer Side

> **Độ khó:** ⭐⭐⭐ Intermediate-Advanced
> **Thời lượng ước tính:** 15-20 giờ
> **Prerequisite:** Phase 5 hoàn thành (Product data tồn tại trong DB)

---

## 🎯 MVP Của Phase Này

- Trang chủ hiển thị sản phẩm featured + mới nhất (SSR cho SEO)
- Trang danh sách sản phẩm có filter (category, giá, shop) + sort + pagination
- Trang chi tiết sản phẩm: ảnh gallery, thông tin, shop info
- Thanh tìm kiếm với Debounce (không spam request)
- SEO: meta tags, Open Graph, structured data (JSON-LD)
- Responsive design (mobile-first)
- Trang shop: hiển thị thông tin shop + danh sách sản phẩm

---

## 🗄️ Database Changes (MVP)

Phase này tập trung vào việc đọc dữ liệu (Query) hiệu quả. **Không có bảng mới** được tạo ra. Tuy nhiên, em cần kiểm tra và đảm bảo các index (chỉ mục) sau đã có sẵn trong file `prisma/schema.prisma` từ các phase trước để tránh quét toàn bộ bảng (Table Scan) khi lượng dữ liệu lớn lên:

- `@@index([slug])` trên `Product` và `Category`: Giúp tìm kiếm theo URL slug cực nhanh (độ phức tạp O(log N) thay vì O(N)).
- `@@index([price])`: Tối ưu cho query lọc theo khoảng giá (`minPrice`, `maxPrice`).
- `@@index([categoryId])`: Tối ưu cho query lọc sản phẩm theo danh mục.
- `@@index([createdAt])`: Tối ưu cho việc sắp xếp sản phẩm mới nhất.

---

## 📋 Task Breakdown

### Task 6.1: API Public Products — Backend (3-4h)

#### `src/modules/product/product.service.ts` (thêm methods public):

```typescript
// Thêm vào ProductService class

/**
 * PUBLIC: Lấy danh sách sản phẩm cho buyer
 * Chỉ hiển thị sản phẩm active, shop active, chưa bị xóa
 */
async getPublicProducts(query: ProductQuery) {
  const { page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
    shop: { status: 'ACTIVE', isActive: true }, // Chỉ lấy SP từ shop active
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        soldCount: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
        shop: {
          select: { name: true, slug: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
}

/**
 * PUBLIC: Lấy chi tiết sản phẩm theo slug (cho SEO)
 */
async getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: { include: { parent: true } },
      shop: {
        select: {
          id: true, name: true, slug: true, logo: true,
          rating: true, createdAt: true,
          _count: { select: { products: true } },
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || !product.isActive || product.deletedAt) {
    throw ApiError.notFound('Sản phẩm không tồn tại');
  }

  // Lấy thêm review stats
  const reviewStats = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...product,
    reviewStats: {
      average: reviewStats._avg.rating || 0,
      count: reviewStats._count.rating,
    },
  };
}

/**
 * PUBLIC: Lấy sản phẩm liên quan (cùng category, cùng shop)
 */
async getRelatedProducts(productId: string, limit = 8) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, shopId: true },
  });
  if (!product) return [];

  return prisma.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      deletedAt: null,
      OR: [
        { categoryId: product.categoryId },
        { shopId: product.shopId },
      ],
    },
    select: {
      id: true, name: true, slug: true, price: true, comparePrice: true,
      images: { where: { isPrimary: true }, take: 1 },
      shop: { select: { name: true, slug: true } },
    },
    take: limit,
    orderBy: { soldCount: 'desc' },
  });
}
```

#### ⚠️ Lỗi fresher hay mắc:

- **Không filter theo shop status:** Sản phẩm từ shop bị suspended vẫn hiện → user mua hàng nhưng shop bị ban → đơn hàng treo. Luôn join + filter `shop.status = ACTIVE`.
- **Trả toàn bộ data không cần thiết:** Public API không cần trả `createdAt`, `updatedAt`, `ownerId`... Dùng `select` chỉ lấy field cần hiển thị → response nhỏ hơn, nhanh hơn.
- **OFFSET pagination cho dataset lớn:** `OFFSET 10000` → DB phải scan 10000 rows rồi skip. Rất chậm. Cho MVP thì OK, sau nên dùng Cursor-based pagination.

---

## 🏁 Checklist Cuối Phase 6

- [ ] `GET /api/v1/products` — API lấy danh sách sản phẩm public hoạt động, hỗ trợ phân trang, tìm kiếm, lọc theo khoảng giá, lọc theo danh mục
- [ ] Lọc sản phẩm public chỉ trả về sản phẩm của shop hoạt động (`shop.status = ACTIVE` và `shop.isActive = true`)
- [ ] `GET /api/v1/products/:slug` — API lấy chi tiết sản phẩm hoạt động, trả về thông tin sản phẩm và shop liên quan
- [ ] Thêm các Database Index cần thiết (`slug`, `price`, `categoryId`, `createdAt`)
- [ ] Commit: "feat: API public products with advanced search, filtering, and indexing"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                    | Link                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| Next.js Server Components | https://nextjs.org/docs/app/building-your-application/rendering/server-components |
| Next.js Metadata API      | https://nextjs.org/docs/app/building-your-application/optimizing/metadata         |
| Schema.org Product        | https://schema.org/Product                                                        |
| Debounce vs Throttle      | https://css-tricks.com/debouncing-throttling-explained-examples/                  |
| Web Vitals & SEO          | https://web.dev/learn-core-web-vitals/                                            |
