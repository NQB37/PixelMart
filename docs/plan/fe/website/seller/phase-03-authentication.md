# Kênh Người Bán - Phase 3: Authentication & Route Guards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng màn hình đăng nhập (Login screen) và bộ lọc định tuyến (Route guards) bảo vệ Kênh người bán sử dụng cấu trúc Page sạch, tách biệt logic Form, Zod schema và Zustand + TanStack Query hooks.

**Architecture:** 
- Trang `pages/Login.tsx` là routing page sạch sẽ, chỉ import và render `<LoginForm />` component.
- Validation Schema được tách biệt hoàn toàn tại `features/auth/schemas/auth.schema.ts`.
- Form Presentation & Logic nằm tại `features/auth/components/LoginForm.tsx`.
- Quản lý auth state với Zustand `auth.store.ts` và TanStack Query hooks.
- Protected Route component kiểm tra vai trò người dùng qua mảng: `user.roles.includes('SELLER') || user.roles.includes('ADMIN')`.

**Tech Stack:** React 18, React Router v6, Zustand, TanStack Query, Axios, Vitest, React Testing Library.

> [!NOTE]
> 📌 **As-built (codebase là chân lý):** Auth đã build trên **`@pixelmart/shared/auth`**: store `createAuthStore("seller-user-info", { persistIsAuthenticated: true })`, axios `createAuthApiClient` (`lib/api.ts`) + `createAuthApi`, hook `useLogin` (TanStack Query), `loginSchema`/`registerSchema` **dùng lại từ shared** (mật khẩu **min 8**), form react-hook-form + zodResolver (`features/auth/components/LoginForm.tsx`), page sạch `pages/Login.tsx`. **Không có component `ProtectedRoute`** — phân quyền route bằng `beforeLoad` trong `src/router.tsx` với `hasRole(user, ["SELLER", "ADMIN"])`; trang `/403` = `pages/Forbidden.tsx`. Khác plan: tài khoản đã đăng nhập nhưng chưa là seller bị đẩy sang `/register-shop` (không phải `/403`).

## Global Constraints

- Node.js version >= 18
- Package manager: pnpm
- Toàn bộ source code của seller nằm trong thư mục `website/seller/`
- Sử dụng Path Alias `@/` trỏ tới `website/seller/src`
- TDD: Mọi component/helper phải viết test trước khi triển khai.
- Kiểm tra phân quyền RBAC: User roles là một mảng `roles` (ví dụ: `['SELLER']`). Phải check `user.roles.includes('SELLER')` để cấp quyền.

---

## 📋 Task Breakdown

### Task 1: Cấu hình Auth Store & TanStack Query Hooks

**Files:**
- Create: `website/seller/src/utils/api.ts`
- Create: `website/seller/src/features/auth/stores/auth.store.ts`
- Create: `website/seller/src/features/auth/services/auth.service.ts`
- Create: `website/seller/src/features/auth/hooks/useLogin.ts`
- Create: `website/seller/src/features/auth/types/auth.ts`
- Test: `website/seller/src/features/auth/tests/auth.store.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `useAuthStore` và `useLogin` mutation hook để gọi API đăng nhập.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/features/auth/tests/auth.store.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/auth.store';

describe('Seller Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('should start with null state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL do store `auth.store.ts` chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Tạo file Axios instance:
Create: `website/seller/src/utils/api.ts`
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Tạo Auth Store:
Create: `website/seller/src/features/auth/stores/auth.store.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON';

export interface User {
  id: string;
  email: string;
  profile: { fullName: string };
  roles: Role[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'seller-user-info',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

Tạo API Service:
Create: `website/seller/src/features/auth/services/auth.service.ts`
```typescript
import { api } from '@/utils/api';
import { LoginInput, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('auth/login', data);
    return response.data;
  },
};
```

Tạo Hook useLogin:
Create: `website/seller/src/features/auth/hooks/useLogin.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      navigate('/');
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS auth.store.test.ts

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/utils/api.ts website/seller/src/features/auth/stores/auth.store.ts website/seller/src/features/auth/hooks/useLogin.ts website/seller/src/features/auth/tests/auth.store.test.ts
git commit -m "feat(seller): implement auth store and login hook using TanStack Query"
```

---

### Task 2: Auth Schemas, LoginForm & Clean Login Screen

**Files:**
- Create: `website/seller/src/features/auth/schemas/auth.schema.ts`
- Create: `website/seller/src/features/auth/components/LoginForm.tsx`
- Create: `website/seller/src/pages/Login.tsx`
- Create: `website/seller/src/features/auth/tests/LoginForm.test.tsx`

**Interfaces:**
- Consumes: `useLogin` mutation hook
- Produces: `LoginForm` component. Giao diện trang Login cực kỳ sạch sẽ.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/features/auth/tests/LoginForm.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../components/LoginForm';
import { MemoryRouter } from 'react-router-dom';

const mockMutate = vi.fn();
vi.mock('../hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })
}));

describe('LoginForm Component', () => {
  it('renders inputs and triggers login on submit', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Tên đăng nhập (Email)');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitBtn = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'seller@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ email: 'seller@test.com', password: 'pass123' });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì các components và schemas chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Tạo file validation schema:
Create: `website/seller/src/features/auth/schemas/auth.schema.ts`
```typescript
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

Tạo Component LoginForm:
Create: `website/seller/src/features/auth/components/LoginForm.tsx`
```typescript
import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { Lock, Mail, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-3">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">PixelMart</h1>
          <p className="text-slate-500 text-sm mt-1">Kênh Quản Lý Người Bán</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-150">
            {(error as any)?.response?.data?.message || 'Đăng nhập thất bại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="Tên đăng nhập (Email)"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                {...register('password')}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-150 disabled:opacity-50"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

Tạo Routing Page cực kỳ sạch sẽ:
Create: `website/seller/src/pages/Login.tsx`
```typescript
import React from 'react';
import LoginForm from '../features/auth/components/LoginForm';

export default function Login() {
  return <LoginForm />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/features/auth/schemas/auth.schema.ts website/seller/src/features/auth/components/LoginForm.tsx website/seller/src/pages/Login.tsx website/seller/src/features/auth/tests/LoginForm.test.tsx
git commit -m "feat(seller): refactor login to clean page and dedicated validation schema"
```

---

### Task 3: Xây dựng Route Guard & Trang Từ Chối Truy Cập (403)

**Files:**
- Create: `website/seller/src/components/auth/ProtectedRoute.tsx`
- Create: `website/seller/src/pages/Forbidden.tsx`
- Modify: `website/seller/src/main.tsx`
- Create: `website/seller/src/tests/guards.test.tsx`

**Interfaces:**
- Consumes: `useAuthStore` from Task 1.
- Produces: `ProtectedRoute` bảo vệ các route nhạy cảm; chuyển hướng user không hợp lệ về `/login` hoặc hiển thị màn hình `/403` cấm truy cập.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/tests/guards.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '../features/auth/stores/auth.store';
import ProtectedRoute from '../components/auth/ProtectedRoute';

vi.mock('../features/auth/stores/auth.store', () => ({
  useAuthStore: (selector: any) => selector({
    user: null,
    isAuthenticated: false,
  })
}));

describe('ProtectedRoute Guard', () => {
  it('redirects unauthorized user to login', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <div>Dashboard</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì `ProtectedRoute` chưa được tạo và chưa có trang `Forbidden.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo trang cấm truy cập:
Create: `website/seller/src/pages/Forbidden.tsx`
```typescript
import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4 font-sans">
      <h1 className="text-6xl font-extrabold text-red-600">403</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Truy cập bị từ chối</h2>
      <p className="mt-2 text-slate-500">Bạn không có quyền truy cập vào khu vực Kênh người bán này.</p>
      <Link to="/login" className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-900 transition">
        Đăng nhập tài khoản khác
      </Link>
    </div>
  );
}
```

Tạo component ProtectedRoute:
Create: `website/seller/src/components/auth/ProtectedRoute.tsx`
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !user.roles.some((r) => allowedRoles.includes(r))) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
```

Cập nhật `main.tsx` để tích hợp `QueryClientProvider` và `ProtectedRoute`:
Modify: `website/seller/src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/index.css';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import SellerLayout from './components/layout/SellerLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerLayout>
                  <Dashboard />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerLayout>
                  <Orders />
                </SellerLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS tất cả các tests.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/auth/ProtectedRoute.tsx website/seller/src/pages/Forbidden.tsx website/seller/src/main.tsx website/seller/src/tests/guards.test.tsx
git commit -m "feat(seller): secure seller endpoints using ProtectedRoute and role matching check"
```

---

## 🏁 Phase Checklist & Common Fresher Errors

### 📋 Phase Complete Checklist
1. Màn hình đăng nhập `/login` là trang sạch sẽ, chỉ chứa component LoginForm.
2. Logic validation và schema được tách rời hoàn toàn tại `features/auth/schemas/auth.schema.ts`.
3. Route guard `ProtectedRoute` tự động chuyển hướng người dùng chưa đăng nhập về `/login`.
4. Người dùng đăng nhập chỉ có role `CUSTOMER` (không có `SELLER` hoặc `ADMIN` trong `roles`) bị chuyển hướng về trang `/403`.

### ⚠️ Common Fresher Errors
1. **Viết validation logic trực tiếp ở Login.tsx**: Hãy chuyển toàn bộ Zod validation và hook calls vào component LoginForm.
2. **Không đồng bộ role checker theo Array**: Luôn sử dụng `user.roles.includes('SELLER')` để kiểm tra quyền thay vì `user.role === 'SELLER'`.
