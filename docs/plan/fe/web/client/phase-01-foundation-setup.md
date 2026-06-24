# Phase 01: Foundation Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo dự án Next.js 15 cho client-web, liên kết với workspace `@pixelmart/shared-web` và dựng bố cục cơ bản (Header, Footer, Container) với cấu hình styling Tailwind CSS v4.

**Architecture:** Sử dụng Next.js App Router làm khung chính. Tạo route group `(storefront)` để nhóm các trang của Buyer có chung Header và Footer. Sử dụng pnpm workspace để import trực tiếp các tiện ích từ `@pixelmart/shared-web`.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Jest, React Testing Library.

## Global Constraints

- Client web portal is located at `web/client-web/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 1.1: Next.js 15 Template Setup & Test Environment Configuration

**Files:**
- Create: `web/client-web/package.json`, `web/client-web/tsconfig.json`, `web/client-web/next.config.ts`, `web/client-web/jest.config.ts`, `web/client-web/jest.setup.ts`
- Test: `web/client-web/__tests__/smoke.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: Môi trường dev Next.js 15 chạy được cùng bộ test suite Jest cấu hình sẵn.

- [ ] **Step 1: Write the failing test**
Tạo file test cơ bản để xác nhận môi trường test chạy được:
Create: `web/client-web/__tests__/smoke.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Next.js Client-Web Smoke Test', () => {
  it('renders a welcome message', () => {
    render(<div id="welcome">Welcome to PixelMart Client</div>);
    const element = screen.getByText('Welcome to PixelMart Client');
    expect(element).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npx jest
```
Expected: FAIL với lỗi không tìm thấy package Jest, Testing Library hoặc `@testing-library/jest-dom/matchers`.

- [ ] **Step 3: Write minimal implementation**
Tạo `web/client-web/package.json` với dependencies cần thiết:
Create: `web/client-web/package.json`
```json
{
  "name": "client-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@pixelmart/shared-web": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.4.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "ts-jest": "^29.2.5"
  }
}
```

Tạo `web/client-web/tsconfig.json`:
Create: `web/client-web/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Tạo `web/client-web/next.config.ts`:
Create: `web/client-web/next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
```

Tạo `web/client-web/jest.config.ts`:
Create: `web/client-web/jest.config.ts`
```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
};

export default createJestConfig(config);
```

Tạo `web/client-web/jest.setup.ts`:
Create: `web/client-web/jest.setup.ts`
```typescript
import '@testing-library/jest-dom';
```

Cài đặt dependencies:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web
pnpm install
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS smoke.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add package.json tsconfig.json next.config.ts jest.config.ts jest.setup.ts __tests__/smoke.test.tsx
git commit -m "feat(client-web): setup Next.js 15 template and Jest testing environment"
```

---

### Task 1.2: Workspace Linking and Tailwind CSS v4 Configuration

**Files:**
- Create: `web/client-web/styles/globals.css`
- Test: `web/client-web/__tests__/tailwind.test.tsx`

**Interfaces:**
- Consumes: `@pixelmart/shared-web`
- Produces: Các biến style CSS và config Tailwind v4 hoạt động trong toàn bộ project.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra xem các class CSS của Tailwind hoặc `@pixelmart/shared-web` có được compile và dùng đúng CSS class:
Create: `web/client-web/__tests__/tailwind.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockButton } from '@pixelmart/shared-web';

describe('Tailwind Workspace Integration', () => {
  it('imports MockButton from shared package and matches styled appearance', () => {
    render(<MockButton label="Shared Click" />);
    const btn = screen.getByRole('button', { name: 'Shared Click' });
    expect(btn).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL vì `@pixelmart/shared-web` chưa được pnpm link đúng cách hoặc thiếu styles.

- [ ] **Step 3: Write minimal implementation**
Cập nhật `web/client-web/styles/globals.css` cấu hình Tailwind CSS v4 kết hợp thư viện:
Create: `web/client-web/styles/globals.css`
```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #10b981;
  --color-brand-secondary: #06b6d4;
  --color-brand-dark: #0f172a;
  --font-sans: 'Inter', sans-serif;
}

@source "../shared/src";
```

Thực thi cài đặt để đảm bảo pnpm workspace link:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web
pnpm install
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS tailwind.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add styles/globals.css __tests__/tailwind.test.tsx
git commit -m "feat(client-web): setup globals.css with Tailwind v4 theme and shared components link"
```

---

### Task 1.3: Core Storefront Layout (Header, Footer, and Layout Shell)

**Files:**
- Create: `web/client-web/app/layout.tsx`, `web/client-web/app/(storefront)/layout.tsx`, `web/client-web/app/(storefront)/page.tsx`, `web/client-web/components/layout/Header.tsx`, `web/client-web/components/layout/Footer.tsx`
- Test: `web/client-web/__tests__/layout.test.tsx`

**Interfaces:**
- Consumes: Styles từ globals.css
- Produces: Layout cấu trúc bao gồm Header cố định trên cùng, Footer dưới cùng, và một viewport container responsive cho Buyer.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra sự xuất hiện của Header, Footer và nội dung chính trên trang chủ storefront:
Create: `web/client-web/__tests__/layout.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../app/(storefront)/page';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

describe('Storefront Layout Components', () => {
  it('renders header navigation', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('PixelMart')).toBeInTheDocument();
  });

  it('renders footer credentials', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 PixelMart/)).toBeInTheDocument();
  });

  it('renders home page main text', () => {
    render(<Page />);
    expect(screen.getByText(/Khám phá sản phẩm tốt nhất/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do các components và file page chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo `web/client-web/components/layout/Header.tsx`:
Create: `web/client-web/components/layout/Header.tsx`
```tsx
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-brand-primary">
            PixelMart
          </Link>
          <nav className="hidden md:flex items-center gap-6" role="navigation">
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-brand-primary">
              Cửa hàng
            </Link>
            <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-brand-primary">
              Danh mục
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-brand-primary">
            Giỏ hàng
          </Link>
          <Link href="/login" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    </header>
  );
}
```

Tạo `web/client-web/components/layout/Footer.tsx`:
Create: `web/client-web/components/layout/Footer.tsx`
```tsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © 2026 PixelMart. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-sm text-gray-500 hover:text-brand-primary cursor-pointer">Điều khoản</span>
            <span className="text-sm text-gray-500 hover:text-brand-primary cursor-pointer">Bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Tạo `web/client-web/app/(storefront)/page.tsx`:
Create: `web/client-web/app/(storefront)/page.tsx`
```tsx
import React from 'react';

export default function Page() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl">
          Khám phá sản phẩm tốt nhất tại PixelMart
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Chợ thương mại điện tử đa người bán hàng đầu dành cho bạn. Mua sắm an toàn, nhanh chóng và dễ dàng.
        </p>
      </section>
    </main>
  );
}
```

Tạo `web/client-web/app/layout.tsx`:
Create: `web/client-web/app/layout.tsx`
```tsx
import React from 'react';
import './styles/globals.css';

export const metadata = {
  title: 'PixelMart - Buyer Storefront',
  description: 'Trang mua sắm dành cho khách hàng trên PixelMart',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
```

Tạo `web/client-web/app/(storefront)/layout.tsx`:
Create: `web/client-web/app/(storefront)/layout.tsx`
```tsx
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col bg-white">
        {children}
      </div>
      <Footer />
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
Expected: PASS layout.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add app/layout.tsx app/\(storefront\)/layout.tsx app/\(storefront\)/page.tsx components/layout/Header.tsx components/layout/Footer.tsx __tests__/layout.test.tsx
git commit -m "feat(client-web): implement core storefront header, footer, and page layout shell"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Quên import styles/globals.css** trong RootLayout khiến giao diện mất hoàn toàn CSS.
2. **Sai alias import (`@/*`)** do cấu hình tsconfig.json không khớp với thư mục thực tế của dự án.
3. **Sử dụng React Server Components không đúng cách**: Cố gắng sử dụng các hooks như `useState` hay `useEffect` trực tiếp trong component server-side (mặc định) mà không khai báo `"use client"` ở đầu file.
4. **Không cấu hình `withCredentials: true`** trong API client dẫn đến việc cookie JWT (HttpOnly) không được gửi tự động kèm request lên API Gateway.

### Checklist Cuối Phase
- [ ] Ổn định monorepo web workspace: `pnpm install` chạy mượt mà tại thư mục `web/`.
- [ ] Next.js app chạy tốt trên cổng mặc định: `pnpm --filter client-web dev` tại cổng `http://localhost:3000`.
- [ ] Header và Footer xuất hiện chuẩn xác và responsive trên Desktop / Mobile.
- [ ] Toàn bộ bộ test suite: `smoke.test.tsx`, `tailwind.test.tsx`, `layout.test.tsx` đều PASS 100%.
