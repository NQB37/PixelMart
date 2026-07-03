# Phase 3: Authentication - Đăng Nhập & Phân Quyền Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết lập cơ chế xác thực cho Admin Portal, xây dựng trang Đăng nhập dành cho Quản trị viên và thành phần bảo vệ route (`ProtectedRoute`) để chỉ cho phép tài khoản có vai trò `ADMIN` truy cập vào hệ thống dashboard.

**Architecture:** Sử dụng React Context làm kho lưu trữ trạng thái xác thực (`AuthContext`) lưu thông tin người dùng (`User`) và trạng thái đăng nhập. Giao tiếp với API Backend qua Axios với cơ chế đính kèm JWT Access Token tự động qua interceptor. Component `ProtectedRoute` đóng vai trò chặn các truy cập trái phép từ những client chưa đăng nhập hoặc không có role `ADMIN`.

**Tech Stack:** React 18, React Router DOM v6, Axios, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `website/admin/`
- Endpoint API Backend cho login: `/api/v1/auth/login` (POST, nhận `email` và `password`, trả về JWT token và thông tin user).
- Quyền truy cập: Chỉ cho phép người dùng có vai trò `ADMIN` (trong mảng `roles`) đi qua route bảo vệ. Các role khác (như `CUSTOMER` hoặc `SELLER`) sẽ bị chặn và hiển thị thông báo Access Denied.
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.

---

## 📋 Task Breakdown

### Task 3.1: Xây dựng AuthProvider & Axios Interceptor

**Files:**
- Create: `website/admin/src/context/AuthContext.tsx`
- Create: `website/admin/src/services/api.ts`
- Create: `website/admin/src/__tests__/AuthContext.test.tsx`

**Interfaces:**
- Consumes: `/api/v1/auth/login` (Backend endpoint)
- Produces: `useAuth` hook cung cấp:
  - `user`: `{ id: string; email: string; profile: { fullName: string }; roles: ('CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON')[] } | null`
  - `isAuthenticated`: `boolean`
  - `login`: `(email: string, password: string) => Promise<void>`
  - `logout`: `() => void`
  - `isLoading`: `boolean`

- [ ] **Step 1: Write the failing test**

```typescript
// website/admin/src/__tests__/AuthContext.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import axios from 'axios';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() }
        },
        post: vi.fn()
      })
    }
  };
});

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.profile.fullName : 'Guest'}</div>
      <div data-testid="auth-state">{isAuthenticated ? 'LoggedIn' : 'LoggedOut'}</div>
      <button onClick={() => login('admin@pixelmart.com', 'password')} aria-label="login-btn">Login</button>
      <button onClick={logout} aria-label="logout-btn">Logout</button>
    </div>
  );
}

describe('AuthContext & Provider', () => {
  it('provides authentication state and functions', async () => {
    const mockAxiosInstance = axios.create();
    vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce({
      data: {
        accessToken: 'mock-access-token',
        user: { id: '1', email: 'admin@pixelmart.com', profile: { fullName: 'Admin User' }, roles: ['ADMIN'] }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent('LoggedOut');

    const loginBtn = screen.getByRole('button', { name: /login-btn/i });
    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('auth-state')).toHaveTextContent('LoggedIn');
    expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi không tìm thấy module `../context/AuthContext`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// website/admin/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// website/admin/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON';

interface User {
  id: string;
  email: string;
  profile: { fullName: string };
  roles: Role[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    const savedToken = localStorage.getItem('admin_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    if (!userData.roles.includes('ADMIN')) {
      throw new Error('Access denied: Unauthorized role');
    }

    localStorage.setItem('admin_token', accessToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/api.ts src/context/AuthContext.tsx src/__tests__/AuthContext.test.tsx
git commit -m "feat(admin): implement AuthProvider state management and axios api configuration"
```

---

### Task 3.2: Phát triển Trang Đăng Nhập (Login Page)

**Files:**
- Create: `website/admin/src/pages/Login.tsx`
- Create: `website/admin/src/__tests__/Login.test.tsx`
- Modify: `website/admin/src/App.tsx`

**Interfaces:**
- Consumes: `useAuth` hook
- Produces: Giao diện form login có kiểm tra hợp lệ client-side (Zod hoặc HTML5) và thông báo lỗi rõ ràng.

- [ ] **Step 1: Write the failing test**

```typescript
// website/admin/src/__tests__/Login.test.tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      login: vi.fn().mockRejectedValue(new Error('Invalid email or password')),
      isAuthenticated: false,
      isLoading: false
    })
  };
});

describe('Login Page', () => {
  it('displays error messages on invalid input and API errors', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    // Test frontend validation
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitBtn);

    // Verify browser validation message or element shows up
    expect(submitBtn).toBeInTheDocument();

    // Fill in correct format but trigger mock API reject
    fireEvent.change(emailInput, { target: { value: 'wrong@pixelmart.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi không tìm thấy component `Login`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// website/admin/src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                  placeholder="Email Address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx src/__tests__/Login.test.tsx
git commit -m "feat(admin): build Admin Login view layout and setup form submission handling"
```

---

### Task 3.3: Xây dựng ProtectedRoute Guard

**Files:**
- Create: `website/admin/src/components/auth/ProtectedRoute.tsx`
- Create: `website/admin/src/__tests__/ProtectedRoute.test.tsx`
- Modify: `website/admin/src/App.tsx`

**Interfaces:**
- Consumes: `useAuth` hook
- Produces: `ProtectedRoute` component bảo vệ các routes con, chuyển hướng người dùng chưa đăng nhập về `/admin/login`, và từ chối các người dùng không có role `ADMIN`.

- [ ] **Step 1: Write the failing test**

```typescript
// website/admin/src/__tests__/ProtectedRoute.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('ProtectedRoute', () => {
  it('redirects to login when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

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

  it('renders content when authenticated user is ADMIN', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'admin@pixelmart.com', profile: { fullName: 'Big Admin' }, roles: ['ADMIN'] },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute>
              <div>Secret Dashboard</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi không tìm thấy `ProtectedRoute` component.

- [ ] **Step 3: Write minimal implementation**

```typescript
// website/admin/src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-teal-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></div>
      </div>
    );
  }

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

```typescript
// website/admin/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
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
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-2xl font-bold">Shops Management</h2>
                    <p className="mt-2 text-slate-400">Approve or suspend platform stores.</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-2xl font-bold">Users Management</h2>
                    <p className="mt-2 text-slate-400">Manage platform users and roles.</p>
                  </div>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/ProtectedRoute.tsx src/__tests__/ProtectedRoute.test.tsx src/App.tsx
git commit -m "feat(admin): secure admin routes via ProtectedRoute and role matching check"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Truy cập `/admin` khi chưa đăng nhập sẽ chuyển hướng ngay lập tức đến `/admin/login`.
- [ ] Nhập thông tin đăng nhập đúng vai trò `ADMIN` chuyển hướng thành công đến `/admin`.
- [ ] Nhập thông tin đăng nhập với tài khoản có role `CUSTOMER` (không có `ADMIN` trong `roles`) hiển thị màn hình 403 Forbidden thay vì truy cập Dashboard.
- [ ] JWT token được lưu đúng trong `localStorage` và gửi kèm trong header `Authorization` của các request Axios tiếp theo.

### ⚠️ Lỗi Fresher hay mắc
1. **Lỗi Infinite Redirect Loop:** Route `/admin/login` không nằm ngoài `ProtectedRoute` hoặc bị bắt trong bộ bảo vệ khiến trình duyệt liên tục chuyển hướng qua lại.
2. **Không xử lý trạng thái Loading:** Khi tải ứng dụng và đang kiểm tra token lưu trong localStorage, không hiển thị màn hình Loading mà trực tiếp chuyển hướng người dùng về login làm mất trạng thái cũ (flickering).
3. **Lưu Token nhạy cảm một cách lỏng lẻo:** Không đồng bộ hóa header Authorization khi token thay đổi hoặc bị xóa khi logout.
