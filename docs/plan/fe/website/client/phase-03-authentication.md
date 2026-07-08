# Phase 03: Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai các trang Đăng nhập / Đăng ký cho khách hàng với thiết kế Page cực kỳ sạch (chỉ import và render component), tách biệt logic Form, Zod validation schema, custom hooks của TanStack Query sang thư mục `/features/auth/`.

**Architecture:** 
- Routing Pages (`app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`) sẽ đóng vai trò là entry points sạch sẽ, không chứa logic UI/Form hay validate.
- Validation Schema được tách biệt hoàn toàn tại `features/auth/schemas/auth.schema.ts`.
- Form Presentation & Logic nằm tại `features/auth/components/LoginForm.tsx` và `RegisterForm.tsx`.
- Quản lý trạng thái đăng nhập bằng Zustand `auth.store.ts` kết hợp TanStack Query mutation hooks (`useLogin`, `useRegister`, `useLogout`).
- Next.js Middleware kiểm tra phân quyền RBAC dựa vào mảng `roles` của người dùng: `user.roles.includes('CUSTOMER')`.

**Tech Stack:** Zustand, TanStack Query, Next.js Middleware, Zod, Vitest, React Testing Library.

> [!IMPORTANT]
> 📌 **As-built (codebase là chân lý).** Auth client **đã build** nhưng dựa trên package dùng chung `@pixelmart/shared/auth` (không tự viết store/service/schema): `createAuthStore('user-info')`, `createAuthApiClient(...)` (interceptor refresh-on-401), `createAuthApi(...)`, và `loginSchema`/`registerSchema` dùng chung (mật khẩu **min 8**, không phải 6). Chặn route bằng **component guard** `features/auth/components/{roleGuard,guestGuard}.tsx` + cổng chờ hydrate — **không** dùng `middleware.ts` như Task 3.3 mô tả. Store thật ở `features/auth/stores/auth.store.ts` (wrapper mỏng bọc factory). Xem `@pixelmart/shared` trong CLAUDE.md.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand, TanStack Query
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.
- TanStack Query sử dụng `QueryClientProvider` cấu hình toàn cục tại `providers/tanstackQuery.tsx` (đã được thiết lập ở RootLayout, không cần thêm provider trong component).
- Kiểm tra phân quyền RBAC: Trường `roles` của người dùng là một mảng `ROLE[]` (ví dụ: `['CUSTOMER']`). Sử dụng `user.roles.includes('CUSTOMER')` thay vì `user.role === 'CUSTOMER'`.

---

### Task 3.1: Zustand Auth Store & TanStack Query Mutation Hooks

**Files:**
- Create: `website/client/features/auth/stores/auth.store.ts`
- Create: `website/client/features/auth/services/auth.service.ts`
- Create: `website/client/features/auth/hooks/useLogin.ts`
- Create: `website/client/features/auth/hooks/useRegister.ts`
- Create: `website/client/features/auth/hooks/useLogout.ts`
- Create: `website/client/features/auth/types/auth.ts`
- Test: `website/client/features/auth/tests/authStore.test.ts`

**Interfaces:**
- Consumes: `/lib/api` (Axios instance)
- Produces: `useAuthStore` Hook quản lý trạng thái auth, `useLogin`/`useRegister`/`useLogout` custom query hooks cho components.

- [ ] **Step 1: Write the failing test for Auth Store**
Tạo file test kiểm tra trạng thái login/logout của authStore:
Create: `website/client/features/auth/tests/authStore.test.ts`
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/auth.store';

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('should initialize with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth state on setAuth', () => {
    const mockUser = { id: 'u1', email: 'john@example.com', roles: ['CUSTOMER'] };
    const mockToken = 'mock-jwt-token';
    
    useAuthStore.getState().setAuth(mockUser, mockToken);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do store `auth.store.ts` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo file types:
Create: `website/client/features/auth/types/auth.ts`
```typescript
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type LoginInput = LoginFormValues;
export type SignupInput = SignupFormValues;
```

Tạo Zustand Auth Store:
Create: `website/client/features/auth/stores/auth.store.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'user-info',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

Tạo API Service:
Create: `website/client/features/auth/services/auth.service.ts`
```typescript
import { api } from '@/lib/api';
import { LoginInput, SignupInput, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('auth/login', data);
    return response.data;
  },
  register: async (data: SignupInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('auth/register', data);
    return response.data;
  },
  logout: async () => {
    await api.post('auth/logout');
  },
};
```

Tạo Hook useLogin:
Create: `website/client/features/auth/hooks/useLogin.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      toast.success('Đăng nhập thành công!');
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại!');
    },
  });
}
```

Tạo Hook useRegister:
Create: `website/client/features/auth/hooks/useRegister.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Đăng ký thành công, vui lòng đăng nhập!');
      router.push('/login');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại!');
    },
  });
}
```

Tạo Hook useLogout:
Create: `website/client/features/auth/hooks/useLogout.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      toast.success('Đăng xuất thành công!');
      router.push('/login');
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS authStore.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add features/auth/stores/auth.store.ts features/auth/services/auth.service.ts features/auth/hooks/useLogin.ts features/auth/hooks/useRegister.ts features/auth/hooks/useLogout.ts features/auth/types/auth.ts features/auth/tests/authStore.test.ts
git commit -m "feat(client): implement Zustand auth store and TanStack Query mutation hooks"
```

---

### Task 3.2: Auth Schemas, Components & Clean Pages

**Files:**
- Create: `website/client/features/auth/schemas/auth.schema.ts`
- Create: `website/client/features/auth/components/LoginForm.tsx`
- Create: `website/client/features/auth/components/RegisterForm.tsx`
- Create: `website/client/app/(auth)/login/page.tsx`
- Create: `website/client/app/(auth)/register/page.tsx`
- Create: `website/client/features/auth/tests/LoginForm.test.tsx`

**Interfaces:**
- Consumes: `useLogin`, `useRegister`
- Produces: `LoginForm` & `RegisterForm` components. Giao diện trang login/register cực kỳ sạch sẽ.

- [ ] **Step 1: Write the failing test forLoginForm**
Tạo file test kiểm tra các trường input trong LoginForm:
Create: `website/client/features/auth/tests/LoginForm.test.tsx`
```tsx
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
  }),
}));

describe('LoginForm Component', () => {
  it('renders login forms fields and triggers login on submit', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Mật khẩu');
    const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL vì các file components và schemas chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Tạo Schema validation:
Create: `website/client/features/auth/schemas/auth.schema.ts`
```typescript
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"]
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
```

Tạo LoginForm Component:
Create: `website/client/features/auth/components/LoginForm.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';

export default function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md border">
        <h2 className="text-center text-3xl font-extrabold text-brand-dark">Đăng nhập</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isPending} className="w-full rounded-md bg-brand-primary py-2 text-white font-semibold hover:bg-emerald-600">
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link href="/register" className="text-brand-primary font-semibold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
```

Tạo RegisterForm Component:
Create: `website/client/features/auth/components/RegisterForm.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRegister } from '../hooks/useRegister';
import { signupSchema, SignupFormValues } from '../schemas/auth.schema';

export default function RegisterForm() {
  const { mutate: registerUser, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormValues) => {
    registerUser(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md border">
        <h2 className="text-center text-3xl font-extrabold text-brand-dark">Đăng ký tài khoản</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isPending} className="w-full rounded-md bg-brand-primary py-2 text-white font-semibold hover:bg-emerald-600">
            {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản? <Link href="/login" className="text-brand-primary font-semibold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
```

Tạo các Routing Pages cực kỳ sạch sẽ:
Create: `website/client/app/(auth)/login/page.tsx`
```tsx
import React from 'react';
import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

Create: `website/client/app/(auth)/register/page.tsx`
```tsx
import React from 'react';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS LoginForm.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/auth/schemas/auth.schema.ts features/auth/components/LoginForm.tsx features/auth/components/RegisterForm.tsx app/\(auth\)/login/page.tsx app/\(auth\)/register/page.tsx features/auth/tests/LoginForm.test.tsx
git commit -m "feat(client): refactor login/register to clean pages and dedicated validation schemas"
```

---

### Task 3.3: Next.js Middleware Route Guards (⚠️ thực tế: dùng component guard `roleGuard`/`guestGuard` + cổng hydrate, KHÔNG phải `middleware.ts`)

**Files:**
- Create: `website/client/middleware.ts`
- Test: `website/client/tests/middleware.test.ts`

**Interfaces:**
- Consumes: NextRequest, NextResponse
- Produces: File middleware kiểm tra HTTP Request, ngăn cấm truy cập `/profile`, `/orders`, `/checkout` nếu thiếu auth token.

- [ ] **Step 1: Write the failing test**
Tạo file test mô phỏng request để verify middleware:
Create: `website/client/tests/middleware.test.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn().mockReturnValue({ status: 'next' }),
    redirect: vi.fn().mockImplementation((url) => ({ status: 'redirect', to: url.toString() })),
  },
}));

describe('Next.js Route Guard Middleware', () => {
  it('allows access to unprotected storefront routes without token', () => {
    const req = new Request('http://localhost:3000/') as unknown as NextRequest;
    Object.defineProperty(req, 'nextUrl', { value: new URL('http://localhost:3000/') });
    Object.defineProperty(req, 'cookies', { value: { get: () => undefined } });
    
    const res = middleware(req);
    expect(res).toEqual({ status: 'next' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL vì file `middleware.ts` chưa được viết.

- [ ] **Step 3: Write minimal implementation**
Tạo Middleware Route Guard:
Create: `website/client/middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile', '/orders', '/checkout'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/orders/:path*', '/checkout/:path*'],
};
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS middleware.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add middleware.ts tests/middleware.test.ts
git commit -m "feat(client): implement middleware route guard protection for private routes"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Viết logic validation trực tiếp trong Page file**: Vi phạm nguyên tắc phân tách trách nhiệm (Separation of Concerns). Page chỉ làm nhiệm vụ Router/Container bọc ngoài.
2. **Quên export types**: Cần export `LoginFormValues` và `SignupFormValues` từ schema file để sử dụng ở Form Component.
3. **Redirect loop**: Middleware redirect không đúng cách gây ra vòng lặp vô hạn.

### Checklist Cuối Phase
- [ ] Các tệp trang `login/page.tsx` và `register/page.tsx` hoàn toàn sạch sẽ, không chứa logic Form.
- [ ] Validation Schema và Types của Form nằm độc lập trong tệp `schemas/auth.schema.ts`.
- [ ] 100% các Vitest tests kiểm thử authentication chạy thành công.
