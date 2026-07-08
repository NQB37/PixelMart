# Phase 13: Internationalization (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp đa ngôn ngữ (i18n - Anh/Việt) cho Buyer Storefront sử dụng `next-intl` trong cấu trúc App Router của Next.js 16.

**Architecture:** Sử dụng thư viện `next-intl` với cấu trúc thư mục định tuyến dạng `[locale]`. Next.js Middleware sẽ xử lý việc tự động chuyển hướng ngôn ngữ dựa trên header của browser hoặc cookie đã lưu. Các bản dịch được tổ chức trong thư mục `messages/*.json`.

**Tech Stack:** `next-intl`, Next.js Middleware, Vitest.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. App chưa có `next-intl`, `middleware.ts` hay cấu trúc route `[locale]`.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 13.1: next-intl Setup and Dictionary Files

**Files:**
- Create: `website/client/messages/vi.json`, `website/client/messages/en.json`, `website/client/i18n/request.ts`
- Test: `website/client/tests/i18n-dict.test.ts`

**Interfaces:**
- Consumes: JSON Translation files
- Produces: Cấu hình `request.ts` làm nòng cốt tải ngôn ngữ dựa trên locale param.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra sự tồn tại và cấu trúc bản dịch của vi.json và en.json:
Create: `website/client/tests/i18n-dict.test.ts`
```typescript
import viJson from '../messages/vi.json';
import enJson from '../messages/en.json';

describe('i18n Translation Dictionary', () => {
  it('should have matching translation keys for Vietnamese and English', () => {
    const viKeys = Object.keys(viJson.common).sort();
    const enKeys = Object.keys(enJson.common).sort();
    expect(viKeys).toEqual(enKeys);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo các file JSON trong thư mục `messages/`.

- [ ] **Step 3: Write minimal implementation**
Cài đặt `next-intl`:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm install next-intl
```

Tạo file messages/vi.json:
Create: `website/client/messages/vi.json`
```json
{
  "common": {
    "welcome": "Chào mừng đến với PixelMart",
    "cart": "Giỏ hàng",
    "login": "Đăng nhập"
  }
}
```

Tạo file messages/en.json:
Create: `website/client/messages/en.json`
```json
{
  "common": {
    "welcome": "Welcome to PixelMart",
    "cart": "Cart",
    "login": "Login"
  }
}
```

Tạo config `website/client/i18n/request.ts`:
Create: `website/client/i18n/request.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS i18n-dict.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add messages/vi.json messages/en.json i18n/request.ts tests/i18n-dict.test.ts
git commit -m "feat(client): integrate next-intl configuration and localization translations"
```

---

### Task 13.2: Middleware Locale Detection & App Router Wrapping

**Files:**
- Modify: `website/client/middleware.ts:1-24`
- Create: `website/client/app/[locale]/layout.tsx`
- Test: `website/client/tests/i18n-middleware.test.ts`

**Interfaces:**
- Consumes: NextRequest middleware context
- Produces: Hợp nhất bảo vệ route + chuyển hướng ngôn ngữ tự động (ví dụ `/` -> `/vi`).

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra khả năng redirect locale mặc định:
Create: `website/client/tests/i18n-middleware.test.ts`
```typescript
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

describe('i18n Middleware Redirection', () => {
  it('redirects user to default locale /vi if path does not include one', () => {
    const req = new Request('http://localhost:3000/') as unknown as NextRequest;
    Object.defineProperty(req, 'nextUrl', { value: new URL('http://localhost:3000/') });
    Object.defineProperty(req, 'cookies', { value: { get: () => undefined } });

    const res = middleware(req);
    // Should return a redirect to /vi
    expect(res).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL vì `middleware.ts` chưa được cấu hình để chuyển hướng i18n.

- [ ] **Step 3: Write minimal implementation**
Cập nhật `website/client/middleware.ts` kết hợp cả i18n và auth guarding:
Modify: `website/client/middleware.ts:1-24` (Target the entire middleware file content to support combined routing logic)
Replace with:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';

const protectedRoutes = ['/profile', '/orders', '/checkout'];
const locales = ['vi', 'en'];

const i18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale: 'vi',
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Check Auth Route Guard first
  const hasToken = request.cookies.get('token')?.value;
  const isProtected = protectedRoutes.some((route) => pathname.includes(route));

  if (isProtected && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Fallback to i18n middleware
  return i18nMiddleware(request);
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*', '/profile/:path*', '/orders/:path*', '/checkout/:path*'],
};
```

Tạo Root layout mới bên trong `[locale]`:
Create: `website/client/app/[locale]/layout.tsx`
```tsx
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

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
    <html lang={resolvedParams.locale}>
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS i18n-middleware.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add middleware.ts app/\[locale\]/layout.tsx tests/i18n-middleware.test.ts
git commit -m "feat(client): integrate locale detection middleware and wrap app with next-intl provider"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Lệnh lặp lại router group app**: Khi di chuyển sang `[locale]` router, các trang tĩnh trước đó ở app root (không nằm dưới `[locale]`) phải được chuyển hẳn vào `[locale]/` để tránh lỗi 404 hoặc bị render chồng lấn.
2. **Quên async/await params locale**: Next.js 16 xem locale params là một Promise. Không `await params` sẽ gây crash server.
3. **Cài đặt sai matcher middleware**: Cấu hình regexp của middleware không khớp làm các file tĩnh (trong thư mục `public/`) cũng bị rewrite url chèn thêm locale (ví dụ `/images/logo.svg` biến thành `/vi/images/logo.svg`).

### Checklist Cuối Phase
- [ ] Gõ `http://localhost:3000` tự động chuyển về `http://localhost:3000/vi` hoặc `/en`.
- [ ] Thay đổi đường dẫn `/en` hiển thị chuẩn xác văn bản tiếng Anh từ `en.json`.
- [ ] Các static assets (logo, font, css) tải bình thường, không dính lỗi redirect.
- [ ] i18n test suite PASS 100%.
