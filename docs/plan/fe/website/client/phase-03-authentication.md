# Phase 03: Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai các trang Đăng nhập / Đăng ký cho khách hàng, quản lý trạng thái xác thực bằng Zustand, và bảo vệ các routes quan trọng (profile, orders, checkout) bằng Next.js Middleware.

**Architecture:** Sử dụng Zustand để lưu trữ JWT và thông tin User hiện tại trên Client. Dùng Next.js Middleware chặn các request SSR hoặc router navigation đến các route được bảo vệ, tự động chuyển hướng về `/login` nếu chưa có token hợp lệ.

**Tech Stack:** Zustand, Next.js Middleware, Zod (validation client-side), Jest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 3.1: Zustand Auth Store & Auth Provider

**Files:**
- Create: `website/client/features/auth/stores/auth.store.ts`, `website/client/providers/AuthProvider.tsx`
- Test: `website/client/__tests__/authStore.test.ts`

**Interfaces:**
- Consumes: `@/lib/api` (api client)
- Produces: `useAuthStore` Hook quản lý thông tin đăng nhập, token, và hàm check trạng thái auth.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra trạng thái login/logout của authStore:
Create: `website/client/__tests__/authStore.test.ts`
```typescript
import { useAuthStore } from '../features/auth/stores/auth.store';

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('should initialize with null user and token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth state on setAuth', () => {
    const mockUser = { id: 'u1', email: 'john@example.com', provider: 'CREDENTIALS', isActive: true, roles: ['CUSTOMER'], profile: { fullName: 'John Doe' } };
    const mockToken = 'mock-jwt-token';
    
    useAuthStore.getState().setAuth(mockUser, mockToken);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on clearAuth', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'john@example.com', provider: 'CREDENTIALS', isActive: true, roles: ['CUSTOMER'], profile: { fullName: 'John' } },
      token: 'jwt',
      isAuthenticated: true
    });

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do store `authStore.ts` chưa được tạo hoặc import lỗi.

- [ ] **Step 3: Write minimal implementation**
Cài đặt zustand:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm install zustand
```

Tạo Zustand Auth Store:
Create: `website/client/features/auth/stores/auth.store.ts`
```typescript
import { create } from 'zustand';

export interface UserProfile {
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface User {
  id: string;
  email: string;
  provider: 'CREDENTIALS' | 'GOOGLE';
  isActive: boolean;
  roles: ('CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON')[];
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

Tạo `website/client/providers/AuthProvider.tsx`:
Create: `website/client/providers/AuthProvider.tsx`
```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../features/auth/stores/auth.store';
import { api } from '@/lib/api';

const AuthContext = createContext<{ isLoading: boolean }>({ isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.success) {
          const { user, token } = response.data.data;
          setAuth(user, token);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, [setAuth, clearAuth]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {!isLoading ? children : (
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
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
git add features/auth/stores/auth.store.ts providers/AuthProvider.tsx __tests__/authStore.test.ts
git commit -m "feat(client): implement Zustand authStore and React AuthProvider wrapper"
```

---

### Task 3.2: Client-side Login & Register UI Pages with Form Validation

**Files:**
- Create: `website/client/app/(auth)/login/page.tsx`, `website/client/app/(auth)/register/page.tsx`
- Test: `website/client/__tests__/auth-pages.test.tsx`

**Interfaces:**
- Consumes: `useAuthStore`
- Produces: Giao diện đăng nhập, đăng ký dạng Form có Zod validation và xử lý submit API.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra các trường input trong Form Đăng nhập & Đăng ký:
Create: `website/client/__tests__/auth-pages.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';
import RegisterPage from '../app/(auth)/register/page';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

describe('Auth Pages UI', () => {
  it('renders login forms fields and error messages', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });

    expect(emailInput).toBeInTheDocument();
    
    // Trigger submit empty validation
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    });
  });

  it('renders register form fields and error messages', async () => {
    render(<RegisterPage />);
    const nameInput = screen.getByLabelText('Họ và tên');
    const submitBtn = screen.getByRole('button', { name: 'Đăng ký' });

    expect(nameInput).toBeInTheDocument();
    
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Họ và tên là bắt buộc')).toBeInTheDocument();
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
Expected: FAIL vì chưa có file `login/page.tsx` và `register/page.tsx`.

- [ ] **Step 3: Write minimal implementation**
Cài đặt validation dependencies:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm install react-hook-form @hookform/resolvers zod
```

Tạo LoginPage:
Create: `website/client/app/(auth)/login/page.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '../../../features/auth/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        setAuth(user, token);
        router.push('/');
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
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
          <button type="submit" className="w-full rounded-md bg-brand-primary py-2 text-white font-semibold hover:bg-emerald-600">
            Đăng nhập
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

Tạo RegisterPage:
Create: `website/client/app/(auth)/register/page.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (response.data && response.data.success) {
        router.push('/login');
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
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
          <button type="submit" className="w-full rounded-md bg-brand-primary py-2 text-white font-semibold hover:bg-emerald-600">
            Đăng ký
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

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS auth-pages.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add app/\(auth\)/login/page.tsx app/\(auth\)/register/page.tsx __tests__/auth-pages.test.tsx
git commit -m "feat(client): design responsive login/register UI pages with Zod validation rules"
```

---

### Task 3.3: Next.js Middleware Route Guards

**Files:**
- Create: `website/client/middleware.ts`
- Test: `website/client/__tests__/middleware.test.ts`

**Interfaces:**
- Consumes: NextRequest, NextResponse
- Produces: File middleware kiểm tra HTTP Request, ngăn cấm truy cập `/profile`, `/orders`, `/checkout` nếu thiếu auth token.

- [ ] **Step 1: Write the failing test**
Tạo file test mô phỏng request để verify middleware:
Create: `website/client/__tests__/middleware.test.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn().mockReturnValue({ status: 'next' }),
    redirect: vi.fn().mockImplementation((url) => ({ status: 'redirect', to: url.toString() })),
  },
}));

describe('Next.js Route Guard Middleware', () => {
  it('allows access to unprotected storefront routes without token', () => {
    const req = new Request('http://localhost:3000/') as unknown as NextRequest;
    // Mock attributes
    Object.defineProperty(req, 'nextUrl', { value: new URL('http://localhost:3000/') });
    Object.defineProperty(req, 'cookies', { value: { get: () => undefined } });
    
    const res = middleware(req);
    expect(res).toEqual({ status: 'next' });
  });

  it('redirects to /login for protected routes if token is missing', () => {
    const req = new Request('http://localhost:3000/profile') as unknown as NextRequest;
    Object.defineProperty(req, 'nextUrl', { value: new URL('http://localhost:3000/profile') });
    Object.defineProperty(req, 'cookies', { value: { get: () => undefined } });

    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/login' }));
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
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat(client): implement middleware route guard protection for private routes"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Redirect loop**: Middleware redirect không đúng cách gây ra vòng lặp vô hạn (ví dụ redirect sang `/login` nhưng `/login` lại bị middleware chặn). Hãy đảm bảo danh sách matchers hoặc code kiểm tra bỏ qua các auth routes.
2. **Không lưu token vào Cookie**: Lưu trữ JWT token chỉ trong state Zustand hoặc localStorage sẽ làm Next.js Middleware (chạy ở Edge/V8 runtime) không thể đọc được lúc SSR. Cần đồng bộ lưu cookie hoặc backend set HttpOnly cookie.
3. **Mất state Zustand khi F5 (Hard reload)**: Zustand mặc định reset về ban đầu nếu reload trang. Cần phối hợp với AuthProvider để gọi endpoint `/auth/me` khôi phục lại trạng thái ban đầu dựa trên token từ cookie.

### Checklist Cuối Phase
- [ ] Giao diện đăng nhập, đăng ký hiển thị mượt mà không lỗi.
- [ ] Truy cập `/profile` hoặc `/checkout` trực tiếp khi chưa đăng nhập sẽ chuyển hướng ngay về `/login?returnUrl=...`.
- [ ] Mật khẩu và email đăng ký được validate chặt chẽ trên UI trước khi gọi API.
- [ ] 100% các Unit tests kiểm thử authentication chạy thành công.
