# Phase 06: Product Display & SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang Danh sách sản phẩm tích hợp ô tìm kiếm Debounce, bộ lọc phân loại sản phẩm (Category Filters), và trang Chi tiết sản phẩm kết xuất phía máy chủ (SSR) kèm SEO Metadata động.

**Architecture:** Sử dụng React hook `useDebounce` để tối ưu số lần gọi API khi người dùng gõ từ khóa tìm kiếm. Trang Chi tiết sản phẩm sử dụng mô hình Server Component trong Next.js App Router để fetch data trực tiếp từ API Gateway và cung cấp SEO metadata thông qua hàm `generateMetadata` cho crawler của Google/Facebook.

**Tech Stack:** Next.js Server Components, custom React Hooks, SEO `generateMetadata` API, Jest.

## Global Constraints

- Client web portal is located at `web/client-web/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 6.1: Search Debounce Hook & Product Filters Component

**Files:**
- Create: `web/client-web/hooks/useDebounce.ts`, `web/client-web/features/product/components/ProductFilters.tsx`
- Test: `web/client-web/hooks/__tests__/useDebounce.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Hook `useDebounce` trì hoãn cập nhật giá trị tìm kiếm và UI `ProductFilters` cho phép lựa chọn bộ lọc.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra xem hook `useDebounce` có cập nhật giá trị đúng thời gian trễ hay không:
Create: `web/client-web/hooks/__tests__/useDebounce.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce Hook', () => {
  it('should return initial value and update value only after specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update props
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Not updated yet

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do chưa tạo hook `useDebounce.ts`.

- [ ] **Step 3: Write minimal implementation**
Tạo Hook `useDebounce.ts`:
Create: `web/client-web/hooks/useDebounce.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Tạo component `ProductFilters.tsx` cho phép filter:
Create: `web/client-web/features/product/components/ProductFilters.tsx`
```tsx
'use client';

import React from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  priceRange: [number, number];
  onChangePriceRange: (range: [number, number]) => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onChangePriceRange,
}: ProductFiltersProps) {
  return (
    <div className="w-full space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h4 className="text-md font-semibold text-brand-dark mb-4">Danh mục sản phẩm</h4>
        <div className="space-y-2">
          <button
            onClick={() => onSelectCategory('')}
            className={`block w-full text-left text-sm px-2 py-1.5 rounded-md ${selectedCategory === '' ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`block w-full text-left text-sm px-2 py-1.5 rounded-md ${selectedCategory === cat.slug ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-brand-dark mb-4">Khoảng giá (VND)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => onChangePriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
            placeholder="Từ"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => onChangePriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
            placeholder="Đến"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS useDebounce.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add hooks/useDebounce.ts features/product/components/ProductFilters.tsx hooks/__tests__/useDebounce.test.ts
git commit -m "feat(client-web): implement useDebounce hook and UI sidebar ProductFilters component"
```

---

### Task 6.2: Product Card Layout and Shop Page Listing

**Files:**
- Create: `web/client-web/features/product/components/ProductCard.tsx`, `web/client-web/app/(storefront)/products/page.tsx`
- Test: `web/client-web/features/product/__tests__/ProductCard.test.tsx`

**Interfaces:**
- Consumes: Tailwind v4 theme utility
- Produces: Card hiển thị thông tin sản phẩm (ảnh, tên, giá, nút Add to Cart) và trang listing sản phẩm của Buyer.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra khả năng render của ProductCard:
Create: `web/client-web/features/product/__tests__/ProductCard.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../components/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 'p1',
    name: 'Sản phẩm thử nghiệm',
    slug: 'san-pham-thu-nghiem',
    price: 150000,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  };

  it('renders product card details properly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Sản phẩm thử nghiệm')).toBeInTheDocument();
    expect(screen.getByText('150.000 ₫')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do chưa tạo component `ProductCard.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Component ProductCard:
Create: `web/client-web/features/product/components/ProductCard.tsx`
```tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-base font-semibold text-brand-primary">
          {formattedPrice}
        </p>
        <button className="mt-4 w-full rounded-md bg-gray-900 py-2 text-xs font-semibold text-white hover:bg-brand-primary transition-colors">
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
}
```

Tạo page `web/client-web/app/(storefront)/products/page.tsx`:
Create: `web/client-web/app/(storefront)/products/page.tsx`
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProductFilters from '../../features/product/components/ProductFilters';
import ProductCard, { Product } from '../../features/product/components/ProductCard';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '@pixelmart/shared-web';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  // Mock Categories
  const categories = [
    { id: 'c1', name: 'Điện thoại', slug: 'dien-thoai' },
    { id: 'c2', name: 'Laptop', slug: 'laptop' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: {
            search: debouncedSearch,
            category: selectedCategory,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
          },
        });
        if (response.data && response.data.success) {
          setProducts(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch products');
      }
    };
    fetchProducts();
  }, [debouncedSearch, selectedCategory, priceRange]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-brand-primary focus:outline-none shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div>
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onChangePriceRange={setPriceRange}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS ProductCard.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/product/components/ProductCard.tsx app/\(storefront\)/products/page.tsx features/product/__tests__/ProductCard.test.tsx
git commit -m "feat(client-web): develop ProductCard component and render dynamic product list with filters"
```

---

### Task 6.3: SSR Product Details Page with dynamic SEO Metadata & Clipboard Sharing

**Files:**
- Create: `web/client-web/app/(storefront)/products/[slug]/page.tsx`, `web/client-web/features/product/components/ShareButton.tsx`
- Test: `web/client-web/app/(storefront)/products/[slug]/__tests__/ProductDetailsPage.test.tsx`, `web/client-web/features/product/__tests__/ShareButton.test.tsx`

**Interfaces:**
- Consumes: Next.js 15 generateMetadata, Clipboard API
- Produces: Trang chi tiết sản phẩm kết xuất SSR hiển thị chính xác tiêu đề, mô tả, tối ưu SEO crawlers và tích hợp nút Chia sẻ sao chép URL vào Clipboard.

- [ ] **Step 1: Write the failing tests**

Tạo file test kiểm tra khả năng render SSR và cấu hình generateMetadata:
Create: `web/client-web/app/(storefront)/products/[slug]/__tests__/ProductDetailsPage.test.tsx`
```tsx
import { generateMetadata } from '../page';

// Mock the API library
jest.mock('@pixelmart/shared-web', () => ({
  api: {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'p1',
          name: 'Điện thoại iPhone 15 Pro',
          description: 'Siêu phẩm iPhone 15 Pro chính hãng Apple.',
          price: 28000000,
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/iphone15.jpg',
        },
      },
    }),
  },
}));

describe('Product Details SSR SEO', () => {
  it('generates correct SEO metadata dynamically based on route params', async () => {
    const params = Promise.resolve({ slug: 'iphone-15-pro' });
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe('Điện thoại iPhone 15 Pro - PixelMart');
    expect(metadata.description).toBe('Siêu phẩm iPhone 15 Pro chính hãng Apple.');
  });
});
```

Tạo file test kiểm tra chức năng Share Button sao chép đường dẫn:
Create: `web/client-web/features/product/__tests__/ShareButton.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareButton from '../components/ShareButton';

describe('ShareButton Component', () => {
  const originalClipboard = { ...global.navigator.clipboard };

  beforeAll(() => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(global.navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/products/test-product' },
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: originalClipboard,
    });
  });

  it('copies the product link to clipboard and displays copied message', async () => {
    render(<ShareButton />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Chia sẻ sản phẩm');

    fireEvent.click(btn);

    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
      'http://localhost/products/test-product'
    );
    expect(await screen.findByText('Đã sao chép liên kết!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do chưa tạo các file component và page.

- [ ] **Step 3: Write minimal implementation**

Tạo Component ShareButton sử dụng Clipboard API:
Create: `web/client-web/features/product/components/ShareButton.tsx`
```tsx
'use client';

import React, { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <svg
        className="h-4 w-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
        />
      </svg>
      {copied ? 'Đã sao chép liên kết!' : 'Chia sẻ sản phẩm'}
    </button>
  );
}
```

Tạo SSR Page `products/[slug]/page.tsx` tích hợp `ShareButton`:
Create: `web/client-web/app/(storefront)/products/[slug]/page.tsx`
```tsx
import React from 'react';
import Image from 'next/image';
import { api } from '@pixelmart/shared-web';
import type { Metadata } from 'next';
import ShareButton from '../../../../features/product/components/ShareButton';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const response = await api.get(`/products/${slug}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Fetch product detail failed', error);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm - PixelMart',
    };
  }
  return {
    title: `${product.name} - PixelMart`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-red-500">
        Sản phẩm không tồn tại hoặc đã bị xóa.
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-white">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-dark">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-brand-primary">{formattedPrice}</p>
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900">Mô tả sản phẩm</h3>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-8">
            <button className="w-full rounded-md bg-brand-primary py-3 text-base font-semibold text-white hover:bg-emerald-600 transition-colors">
              Thêm vào giỏ hàng
            </button>
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS ProductDetailsPage.test.tsx & ShareButton.test.tsx

- [ ] **Step 5: Commit**

Run:
```bash
git add app/\(storefront\)/products/\[slug\]/page.tsx app/\(storefront\)/products/\[slug\]/__tests__/ProductDetailsPage.test.tsx features/product/components/ShareButton.tsx features/product/__tests__/ShareButton.test.tsx
git commit -m "feat(client-web): build SSR Product Details page with dynamic OpenGraph SEO tags and clipboard link sharing"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Quên async/await trong dynamic params**: Trong Next.js 15, `params` của Page và `generateMetadata` là một Promise, bắt buộc phải dùng `await params` để giải quyết giá trị thực.
2. **Kích thước Image lớn (Next/Image layout)**: Dùng `fill` mà không có `sizes` hoặc thẻ cha không có style `relative/absolute` dẫn đến vỡ bố cục hoặc tải ảnh quá nặng. Luôn đặt `position: relative` ở container bao bọc `next/image`.
3. **Thao tác API Client trên client thay vì server**: Fetch dữ liệu chi tiết sản phẩm ở client component làm mất đi tính năng SEO crawlers (không có HTML tĩnh khi view source). Cần giữ trang chi tiết sản phẩm ở chế độ Server Component.

### Checklist Cuối Phase
- [ ] Tìm kiếm bằng ô search tự động debounce 500ms không spam API.
- [ ] Bấm lọc sản phẩm theo category hoặc nhập khoảng giá cập nhật UI sản phẩm tức thì.
- [ ] View source trang Chi tiết sản phẩm (`ctrl+u`) có đầy đủ thẻ `<title>` và `<meta name="description">` tùy thuộc vào sản phẩm.
- [ ] Bộ test suite hoàn tất không lỗi lầm.
