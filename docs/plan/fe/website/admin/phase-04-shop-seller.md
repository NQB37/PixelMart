# Phase 4: Shop & Seller Management - Phê Duyệt & Quản Lý Cửa Hàng Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang Quản lý Cửa hàng (Shops Management) cho Admin sử dụng cấu trúc Page sạch, tách biệt logic quản lý, bảng danh sách và modal xử lý lý do từ chối/đình chỉ sang `/features/shops/`.

**Architecture:** 
- Trang `pages/Shops.tsx` đóng vai trò là entry point sạch, chỉ import và render `<ShopsManager />`.
- Component `ShopsManager.tsx` chứa logic fetch danh sách shop, bộ lọc trạng thái, và modal handling.
- Reusable modal `ActionReasonModal.tsx` nằm tại `features/shops/components/ActionReasonModal.tsx`.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. App `admin` hiện chỉ có `features/auth`; chưa có trang Shops / `ShopsManager` / `ActionReasonModal`, và backend cũng chưa có endpoint duyệt shop cho admin.

---

## 📋 Task Breakdown

### Task 4.1: Xây dựng Danh Sách Shop (Shops Table) với Bộ Lọc

**Files:**
- Create: `website/admin/src/features/shops/components/ShopsManager.tsx`
- Create: `website/admin/src/pages/Shops.tsx`
- Test: `website/admin/src/features/shops/tests/ShopsManager.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/admin/src/features/shops/tests/ShopsManager.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShopsManager from '../components/ShopsManager';

describe('ShopsManager Component', () => {
  it('renders shops manager header', () => {
    render(<ShopsManager />);
    expect(screen.getByText('Shops Management')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd website/admin && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
Tạo component ShopsManager:
Create: `website/admin/src/features/shops/components/ShopsManager.tsx`
```typescript
import React, { useState } from 'react';

export default function ShopsManager() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Shops Management</h2>
    </div>
  );
}
```

Tạo Page sạch:
Create: `website/admin/src/pages/Shops.tsx`
```typescript
import React from 'react';
import ShopsManager from '../features/shops/components/ShopsManager';

export default function Shops() {
  return <ShopsManager />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/shops/components/ShopsManager.tsx src/pages/Shops.tsx src/features/shops/tests/ShopsManager.test.tsx
git commit -m "feat(admin): refactor shops page to use clean page wrapper"
```

---

### Task 4.2: Tích Hợp Nút Phê Duyệt, Từ Chối & Đình Chỉ Hoạt Động Cửa Hàng Kèm Lý Do

**Files:**
- Modify: `website/admin/src/features/shops/components/ShopsManager.tsx`
- Create: `website/admin/src/features/shops/components/ActionReasonModal.tsx`

- [ ] **Step 3: Write ActionReasonModal & Update ShopsManager**
Create: `website/admin/src/features/shops/components/ActionReasonModal.tsx`
```typescript
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ActionReasonModal({ isOpen, onClose, onConfirm, title }: any) {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <h3 className="text-lg font-bold">{title}</h3>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 mt-2 bg-slate-950 border" />
        <button onClick={() => onConfirm(reason)} className="mt-4 bg-teal-500 text-slate-950 p-2 rounded">Confirm</button>
      </div>
    </div>
  );
}
```
(Sau đó cập nhật `ShopsManager.tsx` tích hợp modal này).

- [ ] **Step 5: Commit**
```bash
git add src/features/shops/components/ShopsManager.tsx src/features/shops/components/ActionReasonModal.tsx
git commit -m "feat(admin): refactor reason modal and status updater inside ShopsManager feature component"
```
