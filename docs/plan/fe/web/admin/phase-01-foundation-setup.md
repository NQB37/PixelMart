# Phase 1: Foundation & Setup - Thiết lập nền tảng Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết lập dự án frontend Admin Portal chạy trên React, Vite, TypeScript, cấu hình Vitest để kiểm thử thành phần, cài đặt TailwindCSS và xây dựng khung giao diện Admin Layout Shell gồm Header và Sidebar.

**Architecture:** Sử dụng kiến trúc Single Page Application (SPA) với React Router v6. Tổ chức layout dạng lồng ghép (nested layout) với `AdminLayout` đóng vai trò bọc ngoài các trang con. Sidebar và Header sẽ giao tiếp qua React state để điều chỉnh độ rộng thu gọn (collapsible sidebar) mượt mà bằng CSS transitions.

**Tech Stack:** React 18, Vite 5, TypeScript, TailwindCSS v4, React Router DOM v6, Lucide React (icons), Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `web/admin-web/`
- Phiên bản Node.js tối thiểu: Node.js 18+
- Mọi thành phần UI phải được kiểm thử bằng unit test viết trên Vitest + React Testing Library
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức
- Toàn bộ styles sử dụng các class Tailwind chuẩn, không tự ý viết custom CSS tùy tiện ngoại trừ các biến theme cơ bản

---

## 📋 Task Breakdown

### Task 1.1: Setup React + Vite SPA với TypeScript & Vitest

**Files:**
- Create: `web/admin-web/package.json`
- Create: `web/admin-web/vite.config.ts`
- Create: `web/admin-web/tsconfig.json`
- Create: `web/admin-web/src/setupTests.ts`
- Create: `web/admin-web/src/index.css`
- Create: `web/admin-web/src/main.tsx`
- Create: `web/admin-web/src/App.tsx`
- Create: `web/admin-web/src/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: None (khởi tạo từ đầu)
- Produces: `App` component render màn hình chính, môi trường test Vitest hoạt động tốt, Vite dev server chạy mượt mà.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to PixelMart Admin/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL với lỗi không tìm thấy component `App` hoặc file chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**

```json
// web/admin-web/package.json
{
  "name": "@pixelmart/admin-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "lucide-react": "^0.379.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "jsdom": "^24.1.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.2.2",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

```typescript
// web/admin-web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
```

```typescript
// web/admin-web/src/setupTests.ts
import '@testing-library/jest-dom';
```

```css
/* web/admin-web/src/index.css */
@import "tailwindcss";
```

```typescript
// web/admin-web/src/App.tsx
import React from 'react';

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <h1 className="text-3xl font-bold">Welcome to PixelMart Admin</h1>
    </div>
  );
}
```

```typescript
// web/admin-web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```json
// web/admin-web/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// web/admin-web/tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS 1 test.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json src/
git commit -m "feat(admin): initialize vite project with typescript and vitest"
```

---

### Task 1.2: Cài đặt Layout Shell (Header, Sidebar) & Routing

**Files:**
- Create: `web/admin-web/src/components/layout/AdminLayout.tsx`
- Create: `web/admin-web/src/components/layout/Header.tsx`
- Create: `web/admin-web/src/components/layout/Sidebar.tsx`
- Create: `web/admin-web/src/__tests__/AdminLayout.test.tsx`
- Modify: `web/admin-web/src/App.tsx`

**Interfaces:**
- Consumes: None
- Produces: `AdminLayout` component bọc nội dung chính của các sub-routes. Quản lý trạng thái đóng/mở Sidebar (`isSidebarCollapsed`).

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/AdminLayout.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';

describe('AdminLayout Component', () => {
  it('renders layout components and toggles sidebar expansion', () => {
    render(
      <MemoryRouter>
        <AdminLayout>
          <div>Dashboard View</div>
        </AdminLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('PixelMart Admin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard View')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /toggle-sidebar/i });
    const sidebar = screen.getByTestId('admin-sidebar');
    
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    fireEvent.click(toggleBtn);
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL với lỗi không tìm thấy `AdminLayout` component.

- [ ] **Step 3: Write minimal implementation**

```typescript
// web/admin-web/src/components/layout/Header.tsx
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="toggle-sidebar"
          className="rounded p-1 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">PixelMart Admin</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded p-1 hover:bg-slate-800" aria-label="Notifications">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <span className="hidden text-sm font-medium sm:inline">Admin User</span>
        </div>
      </div>
    </header>
  );
}
```

```typescript
// web/admin-web/src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Shops', path: '/admin/shops', icon: Store },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <aside
      data-testid="admin-sidebar"
      data-collapsed={isCollapsed}
      className={`border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-slate-800 hover:text-white ${
                isActive ? 'bg-slate-800 text-white font-semibold' : ''
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

```typescript
// web/admin-web/src/components/layout/AdminLayout.tsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Header onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```typescript
// web/admin-web/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <p className="mt-2 text-slate-400">Welcome to PixelMart Admin Control Panel.</p>
              </div>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/shops"
          element={
            <AdminLayout>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-2xl font-bold">Shops Management</h2>
                <p className="mt-2 text-slate-400">Approve or suspend platform stores.</p>
              </div>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-2xl font-bold">Users Management</h2>
                <p className="mt-2 text-slate-400">Manage platform users and roles.</p>
              </div>
            </AdminLayout>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS all tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/__tests__/AdminLayout.test.tsx src/App.tsx
git commit -m "feat(admin): build AdminLayout Shell with collapsible sidebar and router config"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Chạy lệnh `npm run build` hoàn thành không có lỗi biên dịch TypeScript.
- [ ] Chạy lệnh `npm run test` vượt qua tất cả các bài unit test.
- [ ] Có thể thu nhỏ Sidebar khi click nút Menu ở Header, layout tự co giãn mượt mà.
- [ ] Các route `/admin`, `/admin/shops`, `/admin/users` hoạt động và hiển thị nội dung mẫu đúng layout.

### ⚠️ Lỗi Fresher hay mắc
1. **Thiếu `shrink-0` cho Icons ở Sidebar:** Khi Sidebar thu hẹp, text bị cắt mất, nếu không có `shrink-0` thì icon cũng bị co nhỏ biến dạng hoặc méo mó.
2. **Không bọc Routes trong `MemoryRouter` hoặc `BrowserRouter` khi viết test:** Component con sử dụng `Link` hoặc `useLocation()` sẽ crash khi kiểm thử nếu không có router context bao bọc bên ngoài.
3. **Transition giật cục:** Không thiết lập transition cho cả thuộc tính `width` của Sidebar và `padding-left` (hoặc margin) của vùng Content, khiến layout xê dịch đột ngột khi đóng/mở.
