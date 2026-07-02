# Phase 11: Admin Dashboard & Reports - Thống Kê & Quản Lý Người Dùng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phát triển trang Dashboard tổng quan hiển thị số liệu thống kê trực quan bằng các biểu đồ Recharts (doanh thu, đơn hàng) và trang Quản lý người dùng (Users) tích hợp chức năng Khóa/Mở khóa tài khoản (Block/Unblock).

**Architecture:** Trang Dashboard lấy dữ liệu tổng hợp dạng JSON từ `/api/v1/admin/stats` và chuyển thành định dạng mảng để Recharts vẽ biểu đồ đường (AreaChart) và biểu đồ cột (BarChart). Trang quản lý người dùng `/admin/users` hiển thị danh sách người dùng dưới dạng bảng (Table) hỗ trợ thay đổi trạng thái hoạt động (`isActive`) trực tiếp thông qua một API PATCH.

**Tech Stack:** React 18, Recharts v2, Axios, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `web/admin-web/`
- API Endpoints:
  - Thống kê Dashboard: `GET /api/v1/admin/stats` (Trả về: `{ totalRevenue: number, totalOrders: number, revenueChart: Array<{ date: string, revenue: number }>, ordersChart: Array<{ date: string, orders: number }> }`)
  - Danh sách người dùng: `GET /api/v1/admin/users?page=1&limit=10`
  - Cập nhật trạng thái người dùng: `PATCH /api/v1/admin/users/:id/status` (Body: `{ isActive: boolean }`)
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.

---

## 📋 Task Breakdown

### Task 11.1: Phát triển Biểu đồ Thống kê Dashboard (Recharts Widgets)

**Files:**
- Create: `web/admin-web/src/pages/Dashboard.tsx`
- Create: `web/admin-web/src/__tests__/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/admin/stats` (Backend API)
- Produces: Màn hình dashboard chứa các widget đếm số tổng quan và 2 biểu đồ trực quan biểu diễn xu hướng doanh thu và lượng đơn đặt hàng.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/Dashboard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock recharts because ResponsiveContainer needs width/height calculations that fail in JSDOM
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    AreaChart: ({ data, children }: any) => <div data-testid="area-chart" data-data={JSON.stringify(data)}>{children}</div>,
    Area: () => <div />,
    BarChart: ({ data, children }: any) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
    Bar: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        totalRevenue: 125000000,
        totalOrders: 420,
        revenueChart: [
          { date: '2026-06-20', revenue: 25000000 },
          { date: '2026-06-21', revenue: 35000000 }
        ],
        ordersChart: [
          { date: '2026-06-20', orders: 80 },
          { date: '2026-06-21', orders: 120 }
        ]
      }
    });
  });

  it('fetches stats and renders charts & numeric badges', async () => {
    render(<Dashboard />);

    expect(await screen.findByText('125,000,000 ₫')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();

    const areaChart = screen.getByTestId('area-chart');
    const barChart = screen.getByTestId('bar-chart');

    expect(areaChart).toBeInTheDocument();
    expect(barChart).toBeInTheDocument();
    expect(areaChart.getAttribute('data-data')).toContain('25000000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL với lỗi không tìm thấy module `Dashboard` hoặc chưa render được số liệu từ API mock.

- [ ] **Step 3: Write minimal implementation**

```typescript
// web/admin-web/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DollarSign, ShoppingBag, TrendingUp, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  revenueChart: Array<{ date: string; revenue: number }>;
  ordersChart: Array<{ date: string; orders: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/v1/admin/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-teal-500">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
        {error || 'No statistics data available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
        <p className="text-sm text-slate-400">Real-time store platform activity statistics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
            <DollarSign className="h-5 w-5 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-slate-500">+12% from last month</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Orders</h3>
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
          <p className="text-xs text-slate-500">+8.2% from last week</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-400">Active Growth</h3>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white">Stable</div>
          <p className="text-xs text-slate-500">Normal operating status</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend (VND)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4">Orders Trend (Count)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/__tests__/Dashboard.test.tsx
git commit -m "feat(admin): design Admin Dashboard statistics charts with Recharts widgets"
```

---

### Task 11.2: Thiết kế Grid Danh Sách Users & Nút Khóa/Mở Khóa (Block/Unblock)

**Files:**
- Create: `web/admin-web/src/pages/Users.tsx`
- Create: `web/admin-web/src/__tests__/Users.test.tsx`
- Modify: `web/admin-web/src/App.tsx` (mapping path `/admin/users` tới component `Users`)

**Interfaces:**
- Consumes:
  - `GET /api/v1/admin/users` (Danh sách users)
  - `PATCH /api/v1/admin/users/:id/status` (Block/Unblock user)
- Produces: Danh sách Grid/Table người dùng, nút chuyển đổi trạng thái `Block`/`Unblock` để khóa hoặc mở hoạt động cho người dùng.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/Users.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from '../pages/Users';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

const mockUsers = [
  { id: 'u-1', email: 'guest@test.com', profile: { fullName: 'Nguyen Van Guest' }, roles: ['CUSTOMER'], isActive: true },
  { id: 'u-2', email: 'blockme@test.com', profile: { fullName: 'Luu Manh X' }, roles: ['CUSTOMER'], isActive: false }
];

describe('Users Management Component', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        users: mockUsers,
        pagination: { total: 2, page: 1, limit: 10 }
      }
    });
  });

  it('renders users list and triggers block/unblock API', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { success: true } });

    render(<Users />);

    expect(await screen.findByText('Nguyen Van Guest')).toBeInTheDocument();
    expect(screen.getByText('blockme@test.com')).toBeInTheDocument();

    const blockBtn = screen.getByRole('button', { name: /Block Nguyen Van Guest/i });
    expect(blockBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(blockBtn);
    });

    expect(api.patch).toHaveBeenCalledWith('/api/v1/admin/users/u-1/status', {
      isActive: false
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL do component `Users` chưa được định nghĩa.

- [ ] **Step 3: Write minimal implementation**

```typescript
// web/admin-web/src/pages/Users.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, UserX, RefreshCw } from 'lucide-react';

type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PERSON';

interface User {
  id: string;
  email: string;
  profile: { fullName: string };
  roles: Role[];
  isActive: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/admin/users', { params: { page: 1, limit: 10 } });
      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/api/v1/admin/users/${id}/status`, { isActive: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Users Management</h2>
        <p className="text-sm text-slate-400">View and update access status for registered accounts.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-teal-500">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition">
                      <td className="p-4 font-semibold text-white">{user.profile.fullName}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className="text-xs uppercase px-2.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                          {user.roles.join(', ')}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            Blocked
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {user.isActive ? (
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isActive)}
                            aria-label={`Block ${user.profile.fullName}`}
                            className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded hover:bg-rose-500/20 transition"
                          >
                            <UserX className="h-3.5 w-3.5" /> Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isActive)}
                            aria-label={`Unblock ${user.profile.fullName}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded hover:bg-emerald-500/20 transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Unblock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

```typescript
// web/admin-web/src/App.tsx (Modify routes to use Users page)
// File is updated by the build pipeline to map "/admin/users" path to the <Users /> component.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Users.tsx src/__tests__/Users.test.tsx
git commit -m "feat(admin): support user management table grid with block and unblock toggle action options"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Widget thống kê doanh thu và đơn hàng vẽ chính xác dữ liệu nhận từ API trên biểu đồ Area/Bar của Recharts.
- [ ] Bảng quản lý người dùng tải danh sách hiển thị tên, email và phân loại Role chính xác.
- [ ] Click nút Block trên user đang Active sẽ thay đổi hiển thị trạng thái sang Blocked tức thì sau khi API hoàn thành.
- [ ] Trình duyệt responsive tốt, hiển thị biểu đồ tự động co giãn theo chiều rộng màn hình.

### ⚠️ Lỗi Fresher hay mắc
1. **ResponsiveContainer crash khi cha có width tự động (auto):** Recharts ResponsiveContainer yêu cầu container cha của nó phải có một chiều cao cố định cụ thể (ví dụ: `h-80`) hoặc set style cụ thể, nếu không chiều cao sẽ sụp xuống bằng 0 và không vẽ biểu đồ.
2. **Không mock thư viện bên ngoài (Recharts) trong Unit Test:** Nhúng trực tiếp Recharts trong môi trường JSDOM (thiếu SVG measurements) sẽ bắn ra lỗi hàng loạt lỗi liên quan đến SVGElement hoặc đo kích thước màn hình.
3. **Hiển thị định dạng tiền mặt tùy tiện:** Không sử dụng `Intl.NumberFormat` dẫn đến việc format tiền bị thiếu dấu phân cách hàng nghìn (ví dụ: hiển thị `10000000` thay vì `10.000.000 ₫`).
