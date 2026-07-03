# Phase 14: Performance Caching & Web Vitals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tối ưu hóa hiệu năng, cải thiện chỉ số Core Web Vitals (LCP, CLS, INP) thông qua tích hợp Google Fonts, sử dụng tối ưu `next/image`, chiến lược cache API, và tải chậm component (Dynamic Imports).

**Architecture:** Sử dụng `next/font/google` để tải font trực tiếp tại máy chủ Next.js và nhúng CSS inline loại bỏ Cumulative Layout Shift. Áp dụng Dynamic Imports (`next/dynamic`) cho các thành phần nặng (như Form Review, Giỏ hàng bay) để giảm kích thước bundle ban đầu. Sử dụng cơ chế Fetch Cache với tùy chọn `revalidate` cho các dữ liệu ít thay đổi (ví dụ: Danh sách category).

**Tech Stack:** Next.js Image Optimization, Next.js Font, next/dynamic, Jest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 14.1: Google Font Optimization & next/image Configuration

**Files:**
- Modify: `website/client/app/\[locale\]/layout.tsx`, `website/client/next.config.ts`
- Test: `website/client/__tests__/optimization-settings.test.tsx`

**Interfaces:**
- Consumes: Google Fonts API
- Produces: Layout Next.js sử dụng font Inter tối ưu không gây CLS và cấu hình Remote Image pattern.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra cấu hình nạp font và cấu hình ảnh từ Cloudinary:
Create: `website/client/__tests__/optimization-settings.test.tsx`
```tsx
import nextConfig from '../next.config';

describe('Next.js Config Optimization Checks', () => {
  it('should restrict image domains to res.cloudinary.com for security and optimization', () => {
    const remotePatterns = nextConfig.images?.remotePatterns;
    expect(remotePatterns).toBeDefined();
    const match = remotePatterns?.some((p) => p.hostname === 'res.cloudinary.com');
    expect(match).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL nếu `next.config.ts` chưa được cập nhật chính xác cấu hình remotePatterns.

- [ ] **Step 3: Write minimal implementation**
Cập nhật font Inter trong `website/client/app/[locale]/layout.tsx`:
Modify: `website/client/app/\[locale\]/layout.tsx` (Target the top import section and font class setup)
Replace the layout structure:
```tsx
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-sans',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  if (!['vi', 'en'].includes(resolvedParams.locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={resolvedParams.locale} className={inter.variable}>
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Cập nhật config Remote Pattern hình ảnh trong `website/client/next.config.ts`:
Modify: `website/client/next.config.ts` (Target the entire NextConfig definition)
Replace with:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS optimization-settings.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add app/\[locale\]/layout.tsx next.config.ts __tests__/optimization-settings.test.tsx
git commit -m "perf(client): optimize Google fonts loading and limit remote images pattern check"
```

---

### Task 14.2: Code Splitting with Dynamic Imports (next/dynamic)

**Files:**
- Create: `website/client/components/HeavyChart.tsx`
- Modify: `website/client/app/(public)/products/\[slug\]/page.tsx:32-60`
- Test: `website/client/__tests__/dynamic-imports.test.tsx`

**Interfaces:**
- Consumes: Custom components
- Produces: Lazy loading các thành phần giao diện không thiết yếu lúc F5 đầu tiên.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm thử render của component load động bằng lazy import:
Create: `website/client/__tests__/dynamic-imports.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <p>Loading heavy component...</p>,
});

describe('Dynamic Imports Performance Tuning', () => {
  it('displays loading fallback initially', () => {
    render(<DynamicComponent />);
    expect(screen.getByText('Loading heavy component...')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo component `HeavyChart.tsx` để import.

- [ ] **Step 3: Write minimal implementation**
Tạo component HeavyChart:
Create: `website/client/components/HeavyChart.tsx`
```tsx
import React from 'react';

export default function HeavyChart() {
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-100">
      <h4 className="font-bold text-gray-800">Thống kê giá cả biến động</h4>
      <p className="text-sm text-gray-500 mt-2">Dữ liệu lớn đồ thị chỉ tải khi người dùng cuộn đến.</p>
    </div>
  );
}
```

Cập nhật `products/[slug]/page.tsx` để load động thành phần WriteReviewForm hoặc HeavyChart:
Modify: `website/client/app/(public)/products/\[slug\]/page.tsx:32-60` (Target bottom JSX structure where dynamic component is embedded)
Replace part of the detail page with dynamic imports support:
```tsx
import dynamic from 'next/dynamic';

const DynamicHeavyChart = dynamic(() => import('../../../../components/HeavyChart'), {
  ssr: false,
  loading: () => <p className="text-gray-500 text-xs">Đang tải biểu đồ...</p>
});
```
(Place `<DynamicHeavyChart />` under product description in the component output JSX).

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS dynamic-imports.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add components/HeavyChart.tsx app/\(storefront\)/products/\[slug\]/page.tsx __tests__/dynamic-imports.test.tsx
git commit -m "perf(client): setup dynamic lazy load code splitting for heavy components"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Load Font Ngoài Máy Chủ (External Link)**: Chèn thẻ `<link href="google-fonts-url">` thủ công trong Head. Điều này làm cho browser phải thực hiện thêm 1 DNS lookup và chặn tiến trình hiển thị trang. Luôn sử dụng `next/font/google`.
2. **Sử dụng `ssr: true` cho Component chứa `window`**: Dynamic import component chứa các hàm của trình duyệt (`window.localStorage` hoặc canvas) mà không khai báo `{ ssr: false }` gây crash lúc server render.

### Checklist Cuối Phase
- [ ] Font chữ web hiển thị đúng, font family khai báo Inter qua class `font-sans`.
- [ ] Ảnh sản phẩm được tối ưu thông qua Next.js Image Optimizer.
- [ ] Màn hình chi tiết sản phẩm hiển thị "Đang tải biểu đồ..." trước khi hiển thị component thống kê hoàn chỉnh.
- [ ] Kiểm thử Performance chạy OK.
