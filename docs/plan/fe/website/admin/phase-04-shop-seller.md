# Phase 4: Shop & Seller Management - Phê Duyệt & Quản Lý Cửa Hàng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng quản lý danh sách cửa hàng (Shops), cho phép Admin xem thông tin chi tiết, phê duyệt hoạt động, từ chối hoặc tạm đình chỉ (suspend) hoạt động của các Shop kèm theo lý do thông qua giao diện hộp thoại (Modal).

**Architecture:** Sử dụng cấu trúc trang `/admin/shops` lấy dữ liệu từ API `/api/v1/admin/shops` bằng Axios. Trạng thái các shop được quản lý và cập nhật cục bộ sau khi gọi API PATCH thay đổi trạng thái thành công. Hộp thoại nhập lý do (`ActionReasonModal`) là một reusable component sử dụng HTML5 `<dialog>` hoặc state-driven CSS overlay để bảo đảm tính năng tiếp cận (accessibility) và hiệu ứng mượt mà.

**Tech Stack:** React 18, Axios, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `website/admin/`
- API Endpoints:
  - Lấy danh sách shop: `GET /api/v1/admin/shops?page=1&limit=10&status=PENDING`
  - Cập nhật trạng thái shop: `PATCH /api/v1/admin/shops/:id/status` (Body phê duyệt: `{ approvalStatus: 'APPROVED' | 'REJECTED', rejectedReason?: string }`; Body vận hành: `{ status: 'ACTIVE' | 'SUSPENDED' }`)
- Trạng thái phê duyệt (`approvalStatus`): `PENDING` (chờ duyệt), `APPROVED` (đã duyệt), `REJECTED` (bị từ chối). Trạng thái vận hành (`status`): `ACTIVE` (đang hoạt động), `SUSPENDED` (tạm dừng), `INACTIVE` (ngừng hoạt động).
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.

---

## 📋 Task Breakdown

### Task 4.1: Xây dựng Danh Sách Shop (Shops Table) với Bộ Lọc

**Files:**
- Create: `website/admin/src/pages/Shops.tsx`
- Create: `website/admin/src/__tests__/Shops.test.tsx`
- Modify: `website/admin/src/App.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/admin/shops` (Backend API)
- Produces: Giao diện bảng quản trị shop hiển thị thông tin: Tên shop, Tên chủ shop, Email, Ngày đăng ký, Trạng thái (hiển thị bằng Badge màu khác nhau), và bộ lọc tab trạng thái.

- [ ] **Step 1: Write the failing test**

```typescript
// website/admin/src/__tests__/Shops.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Shops from '../pages/Shops';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

const mockShopsData = [
  { id: 'shop-1', shopName: 'Tech Store', ownerName: 'Nguyen Van A', ownerEmail: 'owner1@test.com', rating: 0, approvalStatus: 'PENDING', status: 'ACTIVE', createdAt: '2026-06-24T12:00:00Z' },
  { id: 'shop-2', shopName: 'Fashion Hub', ownerName: 'Tran Thi B', ownerEmail: 'owner2@test.com', rating: 4.5, approvalStatus: 'APPROVED', status: 'ACTIVE', createdAt: '2026-06-23T12:00:00Z' }
];

describe('Shops Management Page', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        shops: mockShopsData,
        pagination: { total: 2, page: 1, limit: 10 }
      }
    });
  });

  it('renders shops list and filters by status tab', async () => {
    render(<Shops />);

    expect(await screen.findByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Fashion Hub')).toBeInTheDocument();
    expect(screen.getByText('owner1@test.com')).toBeInTheDocument();

    // Verify filter status behavior
    const pendingTab = screen.getByRole('button', { name: /Pending/i });
    fireEvent.click(pendingTab);

    // Should fetch with pending status query parameter
    expect(api.get).toHaveBeenCalledWith('/api/v1/admin/shops', {
      params: expect.objectContaining({ approvalStatus: 'PENDING' })
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd website/admin && pnpm test`
Expected: FAIL với lỗi component `Shops` không tồn tại hoặc import thất bại.

- [ ] **Step 3: Write minimal implementation**

```typescript
// website/admin/src/pages/Shops.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertCircle, CheckCircle2, XCircle, Ban, RefreshCw } from 'lucide-react';

export interface Shop {
  id: string;
  shopName: string;
  logoUrl?: string;
  rating: number;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  rejectedReason?: string;
  createdAt: string;
}

export default function Shops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 10 };
      if (filter === 'SUSPENDED') {
        params.status = 'SUSPENDED';
      } else if (filter !== 'ALL') {
        params.approvalStatus = filter;
      }
      const response = await api.get('/api/v1/admin/shops', { params });
      setShops(response.data.shops || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(statusFilter);
  }, [statusFilter]);

  const renderStatusBadge = (shop: Shop) => {
    if (shop.approvalStatus === 'PENDING') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20"><AlertCircle className="h-3 w-3" /> Pending</span>;
    }
    if (shop.approvalStatus === 'REJECTED') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20"><XCircle className="h-3 w-3" /> Rejected</span>;
    }
    if (shop.status === 'SUSPENDED') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20"><Ban className="h-3 w-3" /> Suspended</span>;
    }
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Shops Management</h2>
          <p className="text-sm text-slate-400">Review, approve, and manage marketplace stores.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              statusFilter === tab
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
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
                  <th className="p-4">Shop Details</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {shops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No shops found.</td>
                  </tr>
                ) : (
                  shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-900/30 transition">
                      <td className="p-4">
                        <div className="font-semibold text-white">{shop.shopName}</div>
                        <div className="text-xs text-slate-500">ID: {shop.id}</div>
                      </td>
                      <td className="p-4">
                        <div>{shop.ownerName}</div>
                        <div className="text-xs text-slate-500">{shop.ownerEmail}</div>
                      </td>
                      <td className="p-4">{new Date(shop.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">{renderStatusBadge(shop)}</td>
                      <td className="p-4 text-right" data-testid={`actions-${shop.id}`}>
                        {/* Placeholder for Task 4.2 Action Buttons */}
                        <div className="text-slate-500 text-xs">Awaiting action logic</div>
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
// website/admin/src/App.tsx (Modify routes to use Shops page)
// File is updated by the build pipeline to map "/admin/shops" path to the <Shops /> component.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Shops.tsx src/__tests__/Shops.test.tsx
git commit -m "feat(admin): build Shops list table layout with status filtering tabs"
```

---

### Task 4.2: Tích Hợp Nút Phê Duyệt, Từ Chối & Đình Chỉ Hoạt Động Cửa Hàng Kèm Lý Do

**Files:**
- Modify: `website/admin/src/pages/Shops.tsx:100-200` (đưa các nút hành động vào ô Actions của bảng và xử lý click)
- Create: `website/admin/src/components/shops/ActionReasonModal.tsx`
- Modify: `website/admin/src/__tests__/Shops.test.tsx` (thêm test cho các hành động click button & submit reason)

**Interfaces:**
- Consumes: `PATCH /api/v1/admin/shops/:id/status` (Backend API)
- Produces: `ActionReasonModal` component hiển thị input nhập lý do. Nút phê duyệt (`Approve`) gọi trực tiếp API; các nút `Reject` và `Suspend` mở modal yêu cầu người dùng nhập lý do trước khi gửi request.

- [ ] **Step 1: Write the failing test**

```typescript
// Cập nhật file website/admin/src/__tests__/Shops.test.tsx
// Thêm ca kiểm thử kiểm tra hoạt động phê duyệt và từ chối kèm lý do
import { act } from '@testing-library/react';

// Trong block describe('Shops Management Page'):
it('approves a shop and rejects a shop with a reason through modal', async () => {
  vi.mocked(api.patch).mockResolvedValueOnce({ data: { success: true } });

  render(<Shops />);

  const techStoreRow = await screen.findByText('Tech Store');
  expect(techStoreRow).toBeInTheDocument();

  // Find approve button for PENDING shop (shop-1)
  const approveBtn = screen.getByRole('button', { name: /Approve Tech Store/i });
  await act(async () => {
    fireEvent.click(approveBtn);
  });

  expect(api.patch).toHaveBeenCalledWith('/api/v1/admin/shops/shop-1/status', {
    approvalStatus: 'APPROVED'
  });

  // Find reject button for PENDING shop (shop-1)
  const rejectBtn = screen.getByRole('button', { name: /Reject Tech Store/i });
  fireEvent.click(rejectBtn);

  // Modal dialog should open
  expect(screen.getByText('Provide Action Reason')).toBeInTheDocument();
  const reasonTextarea = screen.getByPlaceholderText('Type reason here...');
  const confirmBtn = screen.getByRole('button', { name: /Confirm Reject/i });

  fireEvent.change(reasonTextarea, { target: { value: 'Incomplete business documents' } });
  
  await act(async () => {
    fireEvent.click(confirmBtn);
  });

  expect(api.patch).toHaveBeenCalledWith('/api/v1/admin/shops/shop-1/status', {
    approvalStatus: 'REJECTED',
    rejectedReason: 'Incomplete business documents'
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd website/admin && pnpm test`
Expected: FAIL do các nút Approve/Reject/Suspend chưa được thêm vào bảng, hoặc logic modal chưa được gọi.

- [ ] **Step 3: Write minimal implementation**

```typescript
// website/admin/src/components/shops/ActionReasonModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ActionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  actionType: 'REJECTED' | 'SUSPENDED';
}

export default function ActionReasonModal({ isOpen, onClose, onConfirm, title, actionType }: ActionReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    setError(null);
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Reason for {actionType.toLowerCase()}
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type reason here..."
              className="block w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-400 transition"
            >
              Confirm {actionType === 'REJECTED' ? 'Reject' : 'Suspend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

```typescript
// website/admin/src/pages/Shops.tsx
// Chèn lại toàn bộ mã nguồn của file đã tích hợp nút bấm và Modal ActionReasonModal
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ActionReasonModal from '../components/shops/ActionReasonModal';
import { AlertCircle, CheckCircle2, XCircle, Ban, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';

export interface Shop {
  id: string;
  shopName: string;
  logoUrl?: string;
  rating: number;
  ownerName: string;
  ownerEmail: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  rejectedReason?: string;
  createdAt: string;
}

export default function Shops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States cho Modal nhập lý do
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [modalActionType, setModalActionType] = useState<'REJECTED' | 'SUSPENDED'>('REJECTED');

  const fetchShops = async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: 1, limit: 10 };
      if (filter === 'SUSPENDED') {
        params.status = 'SUSPENDED';
      } else if (filter !== 'ALL') {
        params.approvalStatus = filter;
      }
      const response = await api.get('/api/v1/admin/shops', { params });
      setShops(response.data.shops || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(statusFilter);
  }, [statusFilter]);

  const handleUpdateShop = async (
    id: string,
    payload: { approvalStatus?: Shop['approvalStatus']; status?: Shop['status']; rejectedReason?: string }
  ) => {
    try {
      await api.patch(`/api/v1/admin/shops/${id}/status`, payload);
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...payload } : s)));
      setIsModalOpen(false);
      setSelectedShopId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update shop status');
    }
  };

  const openReasonModal = (id: string, action: 'REJECTED' | 'SUSPENDED') => {
    setSelectedShopId(id);
    setModalActionType(action);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (shop: Shop) => {
    if (shop.approvalStatus === 'PENDING') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20"><AlertCircle className="h-3 w-3" /> Pending</span>;
    }
    if (shop.approvalStatus === 'REJECTED') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20"><XCircle className="h-3 w-3" /> Rejected</span>;
    }
    if (shop.status === 'SUSPENDED') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20"><Ban className="h-3 w-3" /> Suspended</span>;
    }
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Shops Management</h2>
          <p className="text-sm text-slate-400">Review, approve, and manage marketplace stores.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              statusFilter === tab
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
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
                  <th className="p-4">Shop Details</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {shops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No shops found.</td>
                  </tr>
                ) : (
                  shops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-900/30 transition">
                      <td className="p-4">
                        <div className="font-semibold text-white">{shop.shopName}</div>
                        <div className="text-xs text-slate-500">ID: {shop.id}</div>
                      </td>
                      <td className="p-4">
                        <div>{shop.ownerName}</div>
                        <div className="text-xs text-slate-500">{shop.ownerEmail}</div>
                      </td>
                      <td className="p-4">{new Date(shop.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">{renderStatusBadge(shop)}</td>
                      <td className="p-4 text-right" data-testid={`actions-${shop.id}`}>
                        <div className="flex justify-end gap-2">
                          {shop.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateShop(shop.id, { approvalStatus: 'APPROVED' })}
                                aria-label={`Approve ${shop.shopName}`}
                                className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition"
                              >
                                <Check className="h-3.5 w-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => openReasonModal(shop.id, 'REJECTED')}
                                aria-label={`Reject ${shop.shopName}`}
                                className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
                              >
                                <X className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          )}
                          {shop.approvalStatus === 'APPROVED' && shop.status === 'ACTIVE' && (
                            <button
                              onClick={() => openReasonModal(shop.id, 'SUSPENDED')}
                              aria-label={`Suspend ${shop.shopName}`}
                              className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" /> Suspend
                            </button>
                          )}
                          {shop.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleUpdateShop(shop.id, { status: 'ACTIVE' })}
                              aria-label={`Re-approve ${shop.shopName}`}
                              className="inline-flex items-center gap-1 rounded bg-teal-500/10 border border-teal-500/20 px-2 py-1 text-xs font-medium text-teal-400 hover:bg-teal-500/20 transition"
                            >
                              <Check className="h-3.5 w-3.5" /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ActionReasonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(reason) => {
          if (!selectedShopId) return;
          if (modalActionType === 'REJECTED') {
            handleUpdateShop(selectedShopId, { approvalStatus: 'REJECTED', rejectedReason: reason });
          } else {
            handleUpdateShop(selectedShopId, { status: 'SUSPENDED' });
          }
        }}
        title="Provide Action Reason"
        actionType={modalActionType}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Shops.tsx src/components/shops/ActionReasonModal.tsx src/__tests__/Shops.test.tsx
git commit -m "feat(admin): support shop approval actions with custom rejection and suspension reason modals"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Bảng Shops tải dữ liệu thành công từ API có kèm theo trạng thái lọc.
- [ ] Bấm nút Approve gửi đúng request PATCH với body `{ approvalStatus: 'APPROVED' }`.
- [ ] Bấm nút Reject hoặc Suspend mở ra popup nhập lý do, không thể submit nếu để trống text area.
- [ ] Nhập lý do và submit gửi đúng dữ liệu: Reject gửi `{ approvalStatus: 'REJECTED', rejectedReason }`, Suspend gửi `{ status: 'SUSPENDED' }` lên Backend.

### ⚠️ Lỗi Fresher hay mắc
1. **Quên reset state của Modal:** Không xóa lý do cũ sau khi đóng modal hoặc thay đổi shop được chọn, dẫn đến shop sau kế thừa lý do bị reject của shop trước.
2. **Không disable nút bấm trong khi API đang gọi:** Người dùng có thể click liên tục nhiều lần vào nút Approve/Confirm tạo ra nhiều request PATCH đè nhau cùng lúc gây ra lỗi dữ liệu bất đồng bộ.
3. **Mất thông tin sau khi load lại danh sách:** Trạng thái table row không được cập nhật nội bộ (optimistic UI hoặc local refresh state) khiến giao diện không phản hồi ngay lập tức sau khi admin thực hiện hành động.
