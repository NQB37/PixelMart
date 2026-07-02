# ⚡ PHASE 14: Performance Optimization — Redis Caching & DB Indexing

> **Prerequisite:** Phase 12+ hoàn thành.

---

## 🎯 MVP Của Phase Này

- Redis cache cho: categories, featured products, product detail, shop info
- Cache invalidation khi data thay đổi (admin update category, seller update product)
- DB index optimization: `EXPLAIN ANALYZE` cho slow queries
- Response time giảm 5-10x cho cached endpoints
- Rate limiting dùng Redis (thay vì in-memory)
- Session storage cho refresh tokens (optional)

---

## 🗄️ Database Changes (MVP)

Phase này **không tạo bảng mới** nào mà tập trung vào tối ưu hóa hiệu năng truy vấn thông qua việc bổ sung các **Chỉ mục kết hợp (Compound Indexes)** trong file `prisma/schema.prisma`.

### 1. Cập nhật model `Product` trong `prisma/schema.prisma` để thêm các Compound Indexes:

```prisma
model Product {
  // ... các trường cũ giữ nguyên

  // Thêm các compound index phục vụ cho việc lọc nâng cao:
  @@index([categoryId, isActive, deletedAt]) // Tìm sản phẩm theo danh mục đang hoạt động
  @@index([shopId, isActive, deletedAt])       // Tìm sản phẩm của shop đang hoạt động
  @@index([isActive, isFeatured])              // Tìm sản phẩm nổi bật
  @@index([soldCount])                          // Sắp xếp theo bán chạy
}
```

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name add_performance_indexes
```

---

## 📋 Task Breakdown

### Task 14.1: Setup Redis (2-3h)

```bash
# Install Redis locally (hoặc Docker)
docker run -d --name redis -p 6379:6379 redis:alpine

# Backend
cd server
npm install ioredis
npm install -D @types/ioredis
```

#### `src/lib/redis.ts`:

```typescript
import Redis from "ioredis";
import { env } from "@/config/env";

export const redis = new Redis(env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
```

#### `src/utils/cache.ts`:

```typescript
import { redis } from "@/lib/redis";

const DEFAULT_TTL = 3600; // 1 giờ

export const cache = {
  /**
   * Cache-Aside pattern:
   * 1. Check cache → có thì trả luôn
   * 2. Không có → gọi fetcher → lưu cache → trả về
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = DEFAULT_TTL,
  ): Promise<T> {
    // 1. Check cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // 2. Fetch from source
    const data = await fetcher();

    // 3. Save to cache
    await redis.setex(key, ttl, JSON.stringify(data));

    return data;
  },

  async del(pattern: string) {
    if (pattern.includes("*")) {
      // Delete by pattern (e.g., "products:*")
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(pattern);
    }
  },

  async flush() {
    await redis.flushdb();
  },
};

// Cache key constants
export const CACHE_KEYS = {
  CATEGORIES: "categories:tree",
  FEATURED_PRODUCTS: "products:featured",
  PRODUCT_DETAIL: (slug: string) => `product:${slug}`,
  SHOP_DETAIL: (slug: string) => `shop:${slug}`,
  PRODUCT_LIST: (query: string) => `products:list:${query}`,
};

export const CACHE_TTL = {
  CATEGORIES: 3600, // 1 giờ (ít thay đổi)
  FEATURED_PRODUCTS: 300, // 5 phút
  PRODUCT_DETAIL: 600, // 10 phút
  SHOP_DETAIL: 1800, // 30 phút
  PRODUCT_LIST: 120, // 2 phút (thay đổi thường xuyên)
};
```

### Task 14.2: Apply Cache vào Services (3-4h)

```typescript
// TRƯỚC (không cache):
async getCategoryTree() {
  return prisma.category.findMany({ ... });
}

// SAU (có cache):
async getCategoryTree() {
  return cache.getOrSet(
    CACHE_KEYS.CATEGORIES,
    () => prisma.category.findMany({ ... }),
    CACHE_TTL.CATEGORIES
  );
}
```

**Endpoints nên cache:**
| Endpoint | TTL | Lý do |
|---|---|---|
| Category tree | 1h | Hiếm thay đổi, mọi trang đều cần |
| Featured products | 5m | Thay đổi khi admin feature/unfeature |
| Product detail | 10m | Đọc nhiều hơn ghi |
| Shop info | 30m | Ít thay đổi |
| Product list + filters | 2m | Thay đổi khi add/update product |

### Task 14.3: Cache Invalidation (3-4h)

**Quy tắc:** Khi DATA thay đổi → XÓA cache liên quan.

```typescript
// Trong CategoryService.updateCategory():
async updateCategory(id: string, data: any) {
  const result = await prisma.category.update({ ... });

  // Invalidate cache
  await cache.del(CACHE_KEYS.CATEGORIES);

  return result;
}

// Trong ProductService.updateProduct():
async updateProduct(id: string, shopId: string, data: any) {
  const product = await prisma.product.update({ ... });

  // Invalidate caches
  await Promise.all([
    cache.del(CACHE_KEYS.PRODUCT_DETAIL(product.slug)),
    cache.del(CACHE_KEYS.FEATURED_PRODUCTS),
    cache.del('products:list:*'), // Invalidate all product list caches
  ]);

  return product;
}
```

#### ⚠️ Lỗi fresher hay mắc:

- **Cache mà quên invalidate:** Admin đổi giá sản phẩm nhưng user vẫn thấy giá cũ 10 phút → mua với giá sai → tranh cãi.
- **Cache key collision:** `product:123` vs `product:iphone-15` — dùng format nhất quán. Recommend dùng slug/identifier, không dùng numeric id.
- **Không set TTL:** Cache vĩnh viễn → Redis đầy RAM → crash. LUÔN set TTL.
- **Over-caching:** Cache trang checkout (chứa real-time stock) → user thấy "Còn 5" nhưng thật sự hết rồi. KHÔNG cache data cần real-time.
- **`redis.keys('*')` ở production:** Command `KEYS` quét toàn bộ keyspace → block Redis. Dùng `SCAN` cho production, hoặc dùng specific key names.

### Task 14.4: DB Index Optimization (2-3h)

#### Phân tích slow queries:

```sql
-- Bật logging slow queries trong PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
SELECT pg_reload_conf();

-- Phân tích 1 query cụ thể
EXPLAIN ANALYZE
SELECT * FROM products
WHERE "categoryId" = 'xxx'
  AND "isActive" = true
  AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT 20 OFFSET 0;
```

#### Indexes cần check đã có:

```prisma
// Compound indexes cho common queries:
@@index([categoryId, isActive, deletedAt])  // Product listing by category
@@index([shopId, isActive, deletedAt])       // Products by shop
@@index([isActive, isFeatured])              // Featured products
@@index([price])                              // Price range filter
@@index([createdAt])                          // Sort by newest
@@index([soldCount])                          // Sort by best sellers
```

#### Khi nào KHÔNG nên đánh index:

- Cột có ít unique values (boolean `isActive`: chỉ có true/false → index không hiệu quả)
- Bảng nhỏ (<1000 rows) → full scan nhanh hơn index lookup
- Cột hay UPDATE → index phải rebuild mỗi lần update

### Task 14.5: Rate Limiting với Redis (1-2h)

Thay `express-rate-limit` (in-memory) bằng Redis store:

```bash
npm install rate-limit-redis
```

```typescript
import RedisStore from "rate-limit-redis";
import { redis } from "@/lib/redis";

export const loginRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  // ... same config
});
```

> **Tại sao Redis store?** In-memory store chỉ hoạt động trên 1 server instance. Khi scale lên 3 instances (load balanced), user gửi request đến instance 1 (count=1), instance 2 (count=1), instance 3 (count=1) → total 3 nhưng mỗi instance đếm 1. Redis store share count across instances.

---

## 🏁 Checklist Cuối Phase 14

- [ ] Redis connected + health check
- [ ] Category tree cached (1h TTL)
- [ ] Product detail cached (10m TTL)
- [ ] Cache invalidation hoạt động khi update data
- [ ] `EXPLAIN ANALYZE` cho top 5 slow queries → all use index
- [ ] Rate limiting dùng Redis store
- [ ] Benchmark: cached endpoint < 10ms (vs uncached 50-200ms)
- [ ] Graceful shutdown đóng Redis connection
- [ ] Commit: "perf: Redis caching and database index optimization"
