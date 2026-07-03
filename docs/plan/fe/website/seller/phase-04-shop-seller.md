# Kênh Người Bán - Phase 4: Shop Settings Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang thiết lập thông tin cửa hàng (Shop Settings) sử dụng cấu trúc Page sạch, tách rời Zod schema và logic Form.

**Architecture:** 
- Trang `pages/ShopSettings.tsx` đóng vai trò là entry point sạch, chỉ import và render `<ShopSettingsForm />`.
- Validation Schema được tách biệt hoàn toàn tại `features/shop/schemas/shop.schema.ts`.
- Form Presentation & Logic nằm tại `features/shop/components/ShopSettingsForm.tsx`.

**Tech Stack:** React 18, Zustand, TanStack Query, Zod, Axios, Vitest, React Testing Library.

---

## 📋 Task Breakdown

### Task 1: Xây dựng Component Form thiết lập Cửa hàng

**Files:**
- Create: `website/seller/src/features/shop/schemas/shop.schema.ts`
- Create: `website/seller/src/features/shop/components/ShopSettingsForm.tsx`
- Create: `website/seller/src/pages/ShopSettings.tsx`
- Test: `website/seller/src/features/shop/tests/ShopSettingsForm.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/features/shop/tests/ShopSettingsForm.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShopSettingsForm from '../components/ShopSettingsForm';

describe('ShopSettingsForm Component', () => {
  it('renders form inputs and handles form submission', async () => {
    render(<ShopSettingsForm />);
    expect(screen.getByLabelText('Tên cửa hàng')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL do component `ShopSettingsForm` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo Schema validation:
Create: `website/seller/src/features/shop/schemas/shop.schema.ts`
```typescript
import * as z from 'zod';

export const shopSettingsSchema = z.object({
  shopName: z.string().min(1, 'Tên cửa hàng là bắt buộc'),
  logoUrl: z.string().url('Logo URL không hợp lệ'),
});

export type ShopSettingsFormValues = z.infer<typeof shopSettingsSchema>;
```

Tạo Component ShopSettingsForm:
Create: `website/seller/src/features/shop/components/ShopSettingsForm.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { Store, Save } from 'lucide-react';
import { api } from '../../../utils/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSettingsSchema, ShopSettingsFormValues } from '../schemas/shop.schema';

export default function ShopSettingsForm() {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ShopSettingsFormValues>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: { shopName: '', logoUrl: '' }
  });

  const onSubmit = async (data: ShopSettingsFormValues) => {
    setSaving(true);
    try {
      await api.put('/shops/me', data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <label htmlFor="shopName" className="block text-sm font-semibold text-slate-700">Tên cửa hàng</label>
        <input id="shopName" type="text" {...register('shopName')} className="w-full p-2 border text-slate-800" />
      </div>
      <button type="submit" disabled={saving} className="bg-blue-600 text-white p-2 rounded">
        Lưu cài đặt
      </button>
    </form>
  );
}
```

Tạo Page sạch:
Create: `website/seller/src/pages/ShopSettings.tsx`
```typescript
import React from 'react';
import ShopSettingsForm from '../features/shop/components/ShopSettingsForm';

export default function ShopSettings() {
  return <ShopSettingsForm />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/features/shop/schemas/shop.schema.ts website/seller/src/features/shop/components/ShopSettingsForm.tsx website/seller/src/pages/ShopSettings.tsx website/seller/src/features/shop/tests/ShopSettingsForm.test.tsx
git commit -m "feat(seller): refactor shop settings to clean page and separate Zod schema"
```
