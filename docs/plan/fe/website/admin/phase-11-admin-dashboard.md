# Phase 11: Admin Portal Dashboard Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai giao diện trang Tổng quan hệ thống (Dashboard Overview) cho Admin sử dụng cấu trúc Page sạch, tách biệt logic phân tích, biểu đồ và Recharts sang `/features/dashboard/`.

**Architecture:** 
- Trang `pages/Dashboard.tsx` đóng vai trò là entry point sạch, chỉ import và render `<DashboardOverview />`.
- Component `DashboardOverview.tsx` chịu trách nhiệm gọi API, lưu trữ state thống kê, vẽ biểu đồ bằng Recharts.

---

## 📋 Task Breakdown

### Task 11.1: Xây dựng Dashboard Stats Cards & Recharts Chart

**Files:**
- Create: `website/admin/src/features/dashboard/components/DashboardOverview.tsx`
- Create: `website/admin/src/pages/Dashboard.tsx`
- Test: `website/admin/src/features/dashboard/tests/DashboardOverview.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/admin/src/features/dashboard/tests/DashboardOverview.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardOverview from '../components/DashboardOverview';

describe('DashboardOverview Component', () => {
  it('renders overview widgets', () => {
    render(<DashboardOverview />);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd website/admin && pnpm test`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
Tạo component DashboardOverview:
Create: `website/admin/src/features/dashboard/components/DashboardOverview.tsx`
```typescript
import React from 'react';

export default function DashboardOverview() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
    </div>
  );
}
```

Tạo Page sạch:
Create: `website/admin/src/pages/Dashboard.tsx`
```typescript
import React from 'react';
import DashboardOverview from '../features/dashboard/components/DashboardOverview';

export default function Dashboard() {
  return <DashboardOverview />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd website/admin && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/dashboard/components/DashboardOverview.tsx src/pages/Dashboard.tsx src/features/dashboard/tests/DashboardOverview.test.tsx
git commit -m "feat(admin): refactor admin dashboard overview to clean page wrapper"
```
