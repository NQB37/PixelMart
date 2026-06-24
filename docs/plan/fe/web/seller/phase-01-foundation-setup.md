# Kênh Người Bán - Phase 1: Foundation Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo cấu trúc dự án React + Vite + TypeScript cho Kênh người bán (seller-web), cấu hình Tailwind CSS v4, Router DOM, và xây dựng khung giao diện chính (Layout Shell) với Sidebar.

**Architecture:** Sử dụng React + Vite làm Single Page Application (SPA), React Router v6 cho routing, Tailwind CSS v4 cho giao diện responsive, tích hợp Vitest + React Testing Library làm khung kiểm thử đơn vị.

**Tech Stack:** React 18, Vite 5, TypeScript 5, React Router v6, Tailwind CSS v4, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Node.js version >= 18
- Package manager: pnpm
- Toàn bộ source code của seller-web nằm trong thư mục `web/seller-web/`
- Sử dụng Path Alias `@/` trỏ tới `web/seller-web/src`
- TDD: Mọi component/helper phải viết test trước khi code minimal implementation
- Không sử dụng code placeholder (ví dụ: `// TODO`, `/* code here */`). Toàn bộ code trong plan phải hoạt động được.

---

## 📋 Task Breakdown

### Task 1: Khởi tạo dự án Vite & Cấu hình TypeScript, Tailwind v4

**Files:**
- Create: `web/seller-web/package.json`
- Create: `web/seller-web/vite.config.ts`
- Create: `web/seller-web/tsconfig.json`
- Create: `web/seller-web/src/index.css`
- Create: `web/seller-web/index.html`

**Interfaces:**
- Consumes: None (khởi tạo từ đầu)
- Produces: Môi trường lập trình React + TS + Vite hoàn chỉnh với Tailwind v4.

- [ ] **Step 1: Write the failing test**
Vì đây là cấu hình hạ tầng, ta tạo file test đầu tiên kiểm tra xem môi trường test chạy được.
Create: `web/seller-web/src/__tests__/smoke.test.ts`
```typescript
import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
  it('should verify vitest is working', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller-web test run`
Expected: Lệnh fail vì package.json chưa được cấu hình lệnh `test` và vitest chưa được cài đặt.

- [ ] **Step 3: Write minimal implementation**
Tạo file `package.json` để khai báo các dependencies và scripts:
Create: `web/seller-web/package.json`
```json
{
  "name": "seller-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "lucide-react": "^0.379.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.6",
    "jsdom": "^24.1.0",
    "typescript": "^5.2.2",
    "vite": "^5.3.1",
    "vitest": "^1.6.0",
    "tailwindcss": "^4.0.0-alpha.16",
    "@tailwindcss/vite": "^4.0.0-alpha.16"
  }
}
```

Tạo file `vite.config.ts`:
Create: `web/seller-web/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
});
```

Tạo file setup cho test:
Create: `web/seller-web/src/__tests__/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

Tạo file `tsconfig.json`:
Create: `web/seller-web/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ScriptHost", "ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

Tạo CSS file với Tailwind v4:
Create: `web/seller-web/src/index.css`
```css
@import "tailwindcss";

@layer base {
  body {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
}
```

Tạo file `index.html`:
Create: `web/seller-web/index.html`
```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PixelMart - Kênh Người Bán</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Tạo file main entrypoint:
Create: `web/seller-web/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-8 text-center text-xl font-bold">PixelMart Seller Web Foundation</div>
  </React.StrictMode>
);
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller-web test run`
Expected: Lệnh fail vì các dependencies chưa được cài đặt.

- [ ] **Step 3: Write minimal implementation**
Thực thi cài đặt các package trong project.
Run: `pnpm install`

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller-web test run`
Expected: PASS 1/1 test (smoke.test.ts)

- [ ] **Step 5: Commit**
```bash
git add web/seller-web/package.json web/seller-web/vite.config.ts web/seller-web/tsconfig.json web/seller-web/index.html web/seller-web/src/index.css web/seller-web/src/main.tsx web/seller-web/src/__tests__/smoke.test.ts web/seller-web/src/__tests__/setup.ts
git commit -m "feat(seller-web): initialize Vite project with TypeScript, Tailwind v4 and Vitest setup"
```

---

### Task 2: Cấu hình Router & Page Shells cơ bản

**Files:**
- Create: `web/seller-web/src/pages/Dashboard.tsx`
- Create: `web/seller-web/src/pages/Orders.tsx`
- Create: `web/seller-web/src/pages/NotFound.tsx`
- Modify: `web/seller-web/src/main.tsx`
- Create: `web/seller-web/src/__tests__/router.test.tsx`

**Interfaces:**
- Consumes: Cấu hình Vite & packages ở Task 1
- Produces: Router điều hướng cho các trang Dashboard, Orders và trang 404.

- [ ] **Step 1: Write the failing test**
Create: `web/seller-web/src/__tests__/router.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import NotFound from '../pages/NotFound';
import { MemoryRouter } from 'react-router-dom';

describe('Router Page Shells', () => {
  it('renders Dashboard page content', () => {
    render(<Dashboard />);
    expect(screen.getByText('Tổng quan cửa hàng')).toBeInTheDocument();
  });

  it('renders Orders page content', () => {
    render(<Orders />);
    expect(screen.getByText('Quản lý đơn hàng')).toBeInTheDocument();
  });

  it('renders NotFound page content', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404 - Không tìm thấy trang')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller-web test run`
Expected: FAIL do các file pages/Dashboard, pages/Orders, pages/NotFound chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Tạo trang Dashboard:
Create: `web/seller-web/src/pages/Dashboard.tsx`
```typescript
import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">Tổng quan cửa hàng</h1>
      <p className="mt-2 text-slate-600">Chào mừng bạn quay lại với kênh quản lý bán hàng.</p>
    </div>
  );
}
```

Tạo trang Orders:
Create: `web/seller-web/src/pages/Orders.tsx`
```typescript
import React from 'react';

export default function Orders() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h1>
      <p className="mt-2 text-slate-600">Xem và xử lý danh sách đơn đặt hàng.</p>
    </div>
  );
}
```

Tạo trang NotFound:
Create: `web/seller-web/src/pages/NotFound.tsx`
```typescript
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
      <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">404 - Không tìm thấy trang</h2>
      <p className="mt-2 text-slate-500">Trang bạn đang truy cập không tồn tại hoặc đã bị xóa.</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        Quay lại trang chủ
      </Link>
    </div>
  );
}
```

Cập nhật `main.tsx` để tích hợp `react-router-dom`:
Modify: `web/seller-web/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/index.css';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller-web test run`
Expected: PASS 4/4 tests.

- [ ] **Step 5: Commit**
```bash
git add web/seller-web/src/pages/Dashboard.tsx web/seller-web/src/pages/Orders.tsx web/seller-web/src/pages/NotFound.tsx web/seller-web/src/main.tsx web/seller-web/src/__tests__/router.test.tsx
git commit -m "feat(seller-web): add basic routing and page shells for Dashboard, Orders, and 404"
```

---

### Task 3: Xây dựng Layout Shell có Sidebar & Header

**Files:**
- Create: `web/seller-web/src/components/layout/Sidebar.tsx`
- Create: `web/seller-web/src/components/layout/Header.tsx`
- Create: `web/seller-web/src/components/layout/SellerLayout.tsx`
- Modify: `web/seller-web/src/main.tsx`
- Create: `web/seller-web/src/__tests__/layout.test.tsx`

**Interfaces:**
- Consumes: Cấu hình Router và pages từ Task 2.
- Produces: Layout dùng chung `SellerLayout` bao quanh các trang nội bộ của Kênh người bán.

- [ ] **Step 1: Write the failing test**
Create: `web/seller-web/src/__tests__/layout.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import SellerLayout from '../components/layout/SellerLayout';

describe('SellerLayout Component', () => {
  it('renders sidebar navigation links and header info', () => {
    render(
      <MemoryRouter>
        <SellerLayout>
          <div>Child Page Content</div>
        </SellerLayout>
      </MemoryRouter>
    );

    // Kiểm tra liên kết trong sidebar
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Đơn hàng')).toBeInTheDocument();
    
    // Kiểm tra Header có tên Shop
    expect(screen.getByText('Kênh Người Bán')).toBeInTheDocument();
    
    // Kiểm tra content trang con được render
    expect(screen.getByText('Child Page Content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller-web test run`
Expected: FAIL do các file layout chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Tạo Sidebar component:
Create: `web/seller-web/src/components/layout/Sidebar.tsx`
```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { name: 'Đơn hàng', path: '/orders', icon: ShoppingBag },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Store className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-lg tracking-wider">PixelMart</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

Tạo Header component:
Create: `web/seller-web/src/components/layout/Header.tsx`
```typescript
import React from 'react';
import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="font-semibold text-slate-800">Kênh Người Bán</div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-100 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-slate-700">Nguyễn Văn Seller</span>
        </div>
      </div>
    </header>
  );
}
```

Tạo SellerLayout wrapper component:
Create: `web/seller-web/src/components/layout/SellerLayout.tsx`
```typescript
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Cập nhật `main.tsx` để render các page lồng trong `SellerLayout`:
Modify: `web/seller-web/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/index.css';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import SellerLayout from './components/layout/SellerLayout';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SellerLayout>
              <Dashboard />
            </SellerLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <SellerLayout>
              <Orders />
            </SellerLayout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller-web test run`
Expected: PASS tất cả 5 tests bao gồm `layout.test.tsx`.

- [ ] **Step 5: Commit**
```bash
git add web/seller-web/src/components/layout/Sidebar.tsx web/seller-web/src/components/layout/Header.tsx web/seller-web/src/components/layout/SellerLayout.tsx web/seller-web/src/main.tsx web/seller-web/src/__tests__/layout.test.tsx
git commit -m "feat(seller-web): add SellerLayout with Sidebar, Header components and update routing structure"
```

---

## 🏁 Phase Checklist & Common Fresher Errors

### 📋 Phase Complete Checklist
1. Thư mục `web/seller-web` được khởi tạo thành công với cấu hình Vite, tsconfig, package.json sạch.
2. Tailwind CSS v4 được cài đặt qua `@tailwindcss/vite` plugin, biên dịch thành công class utility.
3. Test suite với `vitest` và `@testing-library/react` chạy thành công không có lỗi.
4. Giao diện Sidebar chứa các Tab hoạt động điều hướng chính xác bằng `react-router-dom` Link/NavLink.
5. Cấu hình tuyệt đối `import '@/...'` thay cho đường dẫn tương đối dài dòng hoạt động tốt cả ở runtime lẫn compile-time.

### ⚠️ Common Fresher Errors
- **Error:** Quên import setup file hoặc cấu hình global environment jsdom trong vitest config dẫn đến lỗi `document is not defined` hoặc các matcher như `toBeInTheDocument` không khả dụng.
  - *Fix:* Luôn khai báo `setupFiles: './src/__tests__/setup.ts'` và `environment: 'jsdom'` trong `vite.config.ts`.
- **Error:** Không import `@import "tailwindcss";` trong file css chính khiến giao diện bị vỡ và không ăn style.
  - *Fix:* Khai báo ở dòng đầu tiên của `src/index.css`.
- **Error:** Không cấu hình alias `@/*` đồng bộ giữa `tsconfig.json` và `vite.config.ts` dẫn đến việc IDE gợi ý đường dẫn import đúng nhưng build compiler của Vite báo lỗi file not found.
  - *Fix:* Đảm bảo cả 2 file đều cấu hình alias trỏ về cùng một thư mục `src`.
