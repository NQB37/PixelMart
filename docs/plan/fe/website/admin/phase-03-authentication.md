# Phase 3: Authentication - Đăng Nhập & Phân Quyền Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết lập cơ chế xác thực cho Admin Portal, xây dựng trang Đăng nhập dành cho Quản trị viên với cấu trúc Page cực kỳ sạch sẽ, tách rời Zod validation schema và logic Form.

**Architecture:** 
- Trang `pages/Login.tsx` đóng vai trò là entry point sạch sẽ, chỉ import và render `<LoginForm />` component.
- Validation Schema được tách biệt hoàn toàn tại `features/auth/schemas/auth.schema.ts`.
- Form Presentation & Logic nằm tại `features/auth/components/LoginForm.tsx`.
- Quản lý auth state với Zustand `auth.store.ts` và TanStack Query hooks.
- Component `ProtectedRoute` chặn các truy cập trái phép từ những client chưa đăng nhập hoặc không có role `ADMIN` trong mảng `roles` của người dùng.

**Tech Stack:** React 18, React Router DOM v6, Zustand, TanStack Query, Axios, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `website/admin/`
- Endpoint API Backend cho login: `/api/v1/auth/login` (POST, nhận `email` và `password`, trả về JWT token và thông tin user).
- Quyền truy cập: Chỉ cho phép người dùng có vai trò `ADMIN` (trong mảng `roles`) đi qua route bảo vệ. Các role khác (như `CUSTOMER` hoặc `SELLER`) sẽ bị chặn và hiển thị thông báo Access Denied.
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.
- Kiểm tra phân quyền RBAC: Phải check `user.roles.includes('ADMIN')` để kiểm tra phân quyền thay vì `user.role === 'ADMIN'`.

---

## 📋 Task Breakdown

### Task 3.1: Thiết lập Auth Store & TanStack Query Hooks

**Files:**
- Create: `website/admin/src/services/api.ts`
- Create: `website/admin/src/features/auth/stores/auth.store.ts`
- Create: `website/admin/src/features/auth/services/auth.service.ts`
- Create: `website/admin/src/features/auth/hooks/useLogin.ts`
- Create: `website/admin/src/features/auth/types/auth.ts`
- Test: `website/admin/src/features/auth/tests/auth.store.test.ts`

**Interfaces:**
- Consumes: `/api/v1/auth/login` (Backend endpoint)
- Produces: `useAuthStore` và `useLogin` mutation hook để gọi API đăng nhập.

- [ ] **Step 1: Write the failing test**
Create: `website/admin/src/features/auth/tests/auth.store.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/auth.store';

describe('Admin Auth Store', () => {
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
Run: `cd website/admin && pnpm test`
Expected: FAIL do store `auth.store.ts` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo API instance:
Create: `website/admin/src/services/api.ts`
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Tạo Auth Store:
Create: `website/admin/src/features/auth/stores/auth.store.ts`
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
      setAuth: (user, accessToken) => {
        localStorage.setItem('admin_token', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-user-info',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

Tạo API Service:
Create: `website/admin/src/features/auth/services/auth.service.ts`
```typescript
import api from '@/services/api';
import { LoginInput, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },
};
```

Tạo Hook useLogin:
Create: `website/admin/src/features/auth/hooks/useLogin.ts`
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
      if (!res.user.roles.includes('ADMIN')) {
        throw new Error('Access denied: Unauthorized role');
      }
      setAuth(res.user, res.accessToken);
      navigate('/admin');
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd website/admin && pnpm test`
Expected: PASS auth.store.test.ts

- [ ] **Step 5: Commit**
```bash
git add src/services/api.ts src/features/auth/stores/auth.store.ts src/features/auth/hooks/useLogin.ts src/features/auth/tests/auth.store.test.ts
git commit -m "feat(admin): implement Zustand auth store and login hook using TanStack Query"
```

---

### Task 3.2: Auth Schemas, LoginForm & Clean Login Page

**Files:**
- Create: `website/admin/src/features/auth/schemas/auth.schema.ts`
- Create: `website/admin/src/features/auth/components/LoginForm.tsx`
- Create: `website/admin/src/pages/Login.tsx`
- Create: `website/admin/src/features/auth/tests/LoginForm.test.tsx`
- Modify: `website/admin/src/App.tsx`

**Interfaces:**
- Consumes: `useLogin` hook
- Produces: `LoginForm` component. Giao diện trang Login cực kỳ sạch sẽ.

- [ ] **Step 1: Write the failing test**
Create: `website/admin/src/features/auth/tests/LoginForm.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const mockMutate = vi.fn();
vi.mock('../hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null
  })
}));

describe('LoginForm Component', () => {
  it('displays input fields and triggers login mutate on submit', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@pixelmart.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ email: 'admin@pixelmart.com', password: 'password123' });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi không tìm thấy component `LoginForm`.

- [ ] **Step 3: Write minimal implementation**
Tạo Zod validation schema:
Create: `website/admin/src/features/auth/schemas/auth.schema.ts`
```typescript
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

Tạo Component LoginForm:
Create: `website/admin/src/features/auth/components/LoginForm.tsx`
```typescript
import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { Lock, Mail, AlertCircle } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            PixelMart Admin
          </h2>
          <p className="mt-2 text-sm text-slate-400">Sign in to control platform settings</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{(error as any)?.message || 'Something went wrong.'}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  type="email"
                  placeholder="Email Address"
                  {...register('email')}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register('password')}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

Tạo Routing Page sạch sẽ:
Create: `website/admin/src/pages/Login.tsx`
```typescript
import React from 'react';
import LoginForm from '../features/auth/components/LoginForm';

export default function Login() {
  return <LoginForm />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/auth/schemas/auth.schema.ts src/features/auth/components/LoginForm.tsx src/pages/Login.tsx src/features/auth/tests/LoginForm.test.tsx
git commit -m "feat(admin): refactor login to clean page and dedicated validation schema"
```

---

### Task 3.3: Xây dựng ProtectedRoute Guard

**Files:**
- Create: `website/admin/src/components/auth/ProtectedRoute.tsx`
- Modify: `website/admin/src/App.tsx`

**Interfaces:**
- Consumes: `useAuthStore` from Task 3.1
- Produces: `ProtectedRoute` component bảo vệ các routes con, chuyển hướng người dùng chưa đăng nhập về `/admin/login`, và từ chối các người dùng không có role `ADMIN`.

- [ ] **Step 1: Write the failing test**
Create: `website/admin/src/__tests__/ProtectedRoute.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../features/auth/stores/auth.store';

vi.mock('../features/auth/stores/auth.store', () => ({
  useAuthStore: (selector: any) => selector({
    user: null,
    isAuthenticated: false,
  })
}));

describe('ProtectedRoute', () => {
  it('redirects to login when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute>
              <div>Secret Dashboard</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi không tìm thấy `ProtectedRoute` component.

- [ ] **Step 3: Write minimal implementation**
Tạo component ProtectedRoute:
Create: `website/admin/src/components/auth/ProtectedRoute.tsx`
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.roles.includes('ADMIN')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <h1 className="text-4xl font-extrabold text-rose-500">403 - Forbidden</h1>
        <p className="mt-2 text-slate-400">You do not have permission to access this resource.</p>
        <button
          onClick={() => window.location.href = '/admin/login'}
          className="mt-6 rounded-lg bg-slate-800 px-4 py-2 hover:bg-slate-700 transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

Cập nhật `App.tsx` để tích hợp `QueryClientProvider` và `ProtectedRoute`:
Modify: `website/admin/src/App.tsx`
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                    <p className="mt-2 text-slate-400">Welcome to PixelMart Admin Control Panel.</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/auth/ProtectedRoute.tsx src/App.tsx
git commit -m "feat(admin): secure admin routes via ProtectedRoute and role matching check"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Các tệp trang `Login.tsx` hoàn toàn sạch sẽ, không chứa logic Form.
- [ ] Validation Schema và Types của Form nằm độc lập trong tệp `schemas/auth.schema.ts`.
- [ ] 100% các Vitest tests kiểm thử authentication chạy thành công.
