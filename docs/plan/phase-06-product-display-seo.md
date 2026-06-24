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

### Task 6.2: Next.js Server Components — Trang Chủ (3-4h)

#### `web/client-web/app/(storefront)/page.tsx`:
```typescript
import { Suspense } from 'react';
import { HeroBanner } from '@/features/home/components/HeroBanner';
import { FeaturedProducts } from '@/features/home/components/FeaturedProducts';
import { CategoryShowcase } from '@/features/home/components/CategoryShowcase';
import { NewArrivals } from '@/features/home/components/NewArrivals';
import { ProductGridSkeleton } from '@/components/shared/ProductGridSkeleton';

export const metadata = {
  title: 'PixelMart — Sàn Thương Mại Điện Tử',
  description: 'Mua sắm hàng ngàn sản phẩm chất lượng từ các shop uy tín trên PixelMart.',
  openGraph: {
    title: 'PixelMart — Sàn Thương Mại Điện Tử',
    description: 'Mua sắm hàng ngàn sản phẩm chất lượng từ các shop uy tín.',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default async function HomePage() {
  return (
    <main>
      <HeroBanner />

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Danh Mục Nổi Bật</h2>
        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoryShowcase />
        </Suspense>
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Sản Phẩm Nổi Bật</h2>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Mới Nhất</h2>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <NewArrivals />
        </Suspense>
      </section>
    </main>
  );
}
```

> **Tại sao dùng Server Components?**
> - SEO: Bot Google nhận HTML có sẵn nội dung sản phẩm
> - Performance: Data fetch trên server → gần DB hơn → nhanh hơn
> - Giảm JavaScript gửi xuống client → First Load nhanh hơn

#### `web/client-web/features/home/components/FeaturedProducts.tsx`:
```typescript
import { api } from '@/services/api';
import { ProductCard } from '@/components/shared/ProductCard';

// Server Component — fetch data trên server
export async function FeaturedProducts() {
  const data = await api.get('/products?isFeatured=true&limit=8&sortBy=soldCount&sortOrder=desc');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.data.products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

### Task 6.3: Trang Chi Tiết Sản Phẩm + SEO (3-4h)

#### `web/client-web/app/(storefront)/products/[slug]/page.tsx`:
```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/services/api';
import { ProductGallery } from '@/features/product/components/ProductGallery';
import { ProductInfo } from '@/features/product/components/ProductInfo';
import { ShopInfo } from '@/features/product/components/ShopInfo';
import { RelatedProducts } from '@/features/product/components/RelatedProducts';

interface Props {
  params: { slug: string };
}

// Dynamic metadata cho SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const data = await api.get(`/products/${params.slug}`);
    const product = data.data;

    return {
      title: `${product.name} — PixelMart`,
      description: product.description?.slice(0, 160) || `Mua ${product.name} chính hãng tại PixelMart`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
        type: 'product',
      },
    };
  } catch {
    return { title: 'Sản phẩm — PixelMart' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product;
  try {
    const data = await api.get(`/products/${params.slug}`);
    product = data.data;
  } catch {
    notFound(); // Hiển thị trang 404 đẹp của Next.js
  }

  // JSON-LD Structured Data cho Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img: any) => img.url),
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.shop.name,
      },
    },
    aggregateRating: product.reviewStats?.count > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.reviewStats.average,
          reviewCount: product.reviewStats.count,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductGallery images={product.images} />
          <ProductInfo product={product} />
        </div>

        <div className="mt-8">
          <ShopInfo shop={product.shop} />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản Phẩm Liên Quan</h2>
          <RelatedProducts productId={product.id} />
        </div>
      </div>
    </>
  );
}
```

> **JSON-LD Structured Data:** Google đọc data này để hiện Rich Results (sao vàng, giá, tình trạng kho) ngay trên trang kết quả tìm kiếm.

---

### Task 6.4: Thanh Tìm Kiếm với Debounce (2-3h)

#### `web/client-web/hooks/useDebounce.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

#### `web/client-web/components/layout/Header/SearchBar.tsx`:
```typescript
'use client'; // Client Component vì cần state + effects

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Fetch suggestions
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products?search=${debouncedQuery}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.data.products);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
          {suggestions.map((product: any) => (
            <button
              key={product.id}
              className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-3"
              onClick={() => {
                router.push(`/products/${product.slug}`);
                setIsOpen(false);
                setQuery('');
              }}
            >
              {product.images?.[0] && (
                <img src={product.images[0].url} alt="" className="w-10 h-10 object-cover rounded" />
              )}
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
```

> **Tại sao Debounce?**
> User gõ "iPhone" = 6 ký tự = 6 requests nếu không debounce. Với 1000 users cùng lúc = 6000 requests/giây → server chết. Debounce 300ms: chỉ gửi 1 request sau khi user dừng gõ.

#### ⚠️ Lỗi fresher hay mắc:
- **Không handle trang 404:** User vào `/products/khong-co` → trang trắng hoặc crash. Dùng `notFound()` của Next.js.
- **Client-side fetch trong Server Component:** Server Components không có `useState`, `useEffect`. Nếu cần interactivity → tách thành Client Component (`'use client'`).
- **SEO metadata hardcode:** Mỗi trang sản phẩm phải có title/description riêng từ data. Không phải tất cả đều "PixelMart — Sàn TMĐT".
- **Quên `encodeURIComponent` cho search query:** User tìm "iPhone 15 Pro" → URL phải là `?q=iPhone%2015%20Pro`, không phải `?q=iPhone 15 Pro`.

---

### Task 6.5: Trang Danh Sách Sản Phẩm + Filters (3-4h)

Tạo trang `/products` với:
- **URL params:** `/products?category=dien-thoai&minPrice=10000000&maxPrice=30000000&sort=price-asc&page=2`
- **Filter sidebar:** Category tree, Price range slider
- **Sort dropdown:** Mới nhất, Giá tăng, Giá giảm, Bán chạy
- **Pagination:** Hoặc Load More button
- **Responsive:** Filter sidebar ẩn trên mobile, hiện dạng bottom sheet khi bấm nút "Bộ lọc"

#### Key principle — URL-driven state:
```
Filter state lưu ở URL (searchParams), KHÔNG ở useState.
→ User share link cho bạn → bạn thấy cùng kết quả filter.
→ Nhấn Back → quay lại filter cũ.
→ SEO: Google index được trang đã filter.
```

---

## 🏁 Checklist Cuối Phase 6

- [ ] Trang chủ hiển thị featured products + new arrivals (SSR)
- [ ] Trang danh sách sản phẩm có filter, sort, pagination
- [ ] Trang chi tiết sản phẩm có gallery, thông tin, shop info
- [ ] Thanh tìm kiếm với debounce + dropdown suggestions
- [ ] SEO: `<title>`, `<meta>`, Open Graph, JSON-LD cho mỗi product
- [ ] 404 page khi sản phẩm không tồn tại
- [ ] Responsive trên mobile
- [ ] Trang shop `/shops/:slug` hiện thông tin + sản phẩm
- [ ] Commit: "feat: product display with SSR, search, and SEO optimization"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề | Link |
|---|---|
| Next.js Server Components | https://nextjs.org/docs/app/building-your-application/rendering/server-components |
| Next.js Metadata API | https://nextjs.org/docs/app/building-your-application/optimizing/metadata |
| Schema.org Product | https://schema.org/Product |
| Debounce vs Throttle | https://css-tricks.com/debouncing-throttling-explained-examples/ |
| Web Vitals & SEO | https://web.dev/learn-core-web-vitals/ |
