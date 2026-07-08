# Phase 04: Shop Registration Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang đăng ký mở cửa hàng (Shop Registration) cho phép người mua (Buyer) nâng cấp tài khoản trở thành người bán (Seller) thông qua biểu mẫu Wizard nhiều bước.

**Architecture:** Sử dụng React Hook Form kết hợp Zod schema để quản lý dữ liệu đa bước trong một state duy nhất. Tách biệt hoàn toàn Zod schema tại file `schemas/shop.schema.ts`. Mỗi bước (Thông tin shop, Địa chỉ lấy hàng, Tài khoản ngân hàng) được phân thành các sub-components riêng biệt trong component `RegisterShopWizard.tsx`. Trang Router Page đóng vai trò làm entry point sạch sẽ.

**Tech Stack:** React Hook Form, Zod, Tailwind CSS (v4), Vitest.

> [!IMPORTANT]
> 📌 **As-built (codebase là chân lý).** Wizard đăng ký shop **không** được build trong app `client` — nó được build trong app **`seller`** (xem `docs/plan/fe/website/seller/phase-04-shop-seller.md`). App `client` hiện **không có** feature `shop`. Endpoint thật là `POST /shops` (không phải `/shops/register`) và schema thật gồm cả **KYC (CCCD) + upload ảnh** (xem BE Phase 4). Toàn bộ plan dưới đây là thiết kế mục tiêu, phòng khi sau này muốn cho đăng ký shop ngay trong client.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 4.1: Multi-step Shop Registration Wizard Form

**Files:**
- Create: `website/client/features/shop/schemas/shop.schema.ts`
- Create: `website/client/features/shop/components/RegisterShopWizard.tsx`
- Create: `website/client/app/(public)/shop/register/page.tsx`
- Test: `website/client/features/shop/tests/RegisterShopWizard.test.tsx`

**Interfaces:**
- Consumes: `@/lib/api` (api client for endpoints `/shops/register`)
- Produces: Thành phần giao diện RegisterShopWizard cho phép Buyer nhập thông tin đa bước với validate chặt chẽ.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra hoạt động của Wizard: chuyển bước, validate dữ liệu đầu vào.
Create: `website/client/features/shop/tests/RegisterShopWizard.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterShopWizard from '../components/RegisterShopWizard';
import { MemoryRouter } from 'react-router-dom';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

describe('Shop Registration Wizard', () => {
  it('renders Step 1 (Shop Info) initially and blocks navigation on invalid data', async () => {
    render(<RegisterShopWizard />);
    
    expect(screen.getByText('Bước 1: Thông tin cửa hàng')).toBeInTheDocument();
    
    const nextBtn = screen.getByRole('button', { name: 'Tiếp tục' });
    fireEvent.click(nextBtn);

    // Should stay on step 1 due to validation errors
    await waitFor(() => {
      expect(screen.getByText('Tên cửa hàng là bắt buộc')).toBeInTheDocument();
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
Expected: FAIL do component `RegisterShopWizard.tsx` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo Schema file validation:
Create: `website/client/features/shop/schemas/shop.schema.ts`
```typescript
import * as z from 'zod';

export const shopSchema = z.object({
  shopName: z.string().min(1, 'Tên cửa hàng là bắt buộc'),
  recipientName: z.string().min(1, 'Tên người lấy hàng là bắt buộc'),
  phone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại gồm 10-11 chữ số'),
  street: z.string().min(5, 'Địa chỉ lấy hàng phải từ 5 ký tự trở lên'),
  provinceId: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  wardID: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  bankName: z.string().min(1, 'Tên ngân hàng là bắt buộc'),
  bankAccount: z.string().min(5, 'Số tài khoản không hợp lệ'),
  bankOwner: z.string().min(1, 'Tên chủ tài khoản là bắt buộc'),
});

export type ShopFormValues = z.infer<typeof shopSchema>;
```

Tạo component RegisterShopWizard:
Create: `website/client/features/shop/components/RegisterShopWizard.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { shopSchema, ShopFormValues } from '../schemas/shop.schema';

export default function RegisterShopWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { register, trigger, handleSubmit, formState: { errors } } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    let fieldsToValidate: Array<keyof ShopFormValues> = [];
    if (step === 1) {
      fieldsToValidate = ['shopName'];
    } else if (step === 2) {
      fieldsToValidate = ['recipientName', 'phone', 'street', 'provinceId', 'wardID'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: ShopFormValues) => {
    try {
      const response = await api.post('/shops/register', data);
      if (response.data && response.data.success) {
        router.push('/seller/dashboard');
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || 'Failed to register shop');
    }
  };

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 rounded-xl shadow-md my-8 border">
      {/* Progress Bar */}
      <div className="mb-8 flex justify-between">
        {['Thông tin', 'Địa chỉ', 'Tài khoản'].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-bold ${step >= idx + 1 ? 'bg-brand-primary' : 'bg-gray-300'}`}>
              {idx + 1}
            </span>
            <span className={`text-sm font-medium ${step >= idx + 1 ? 'text-brand-dark' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Bước 1: Thông tin cửa hàng</h3>
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Tên cửa hàng</label>
              <input
                id="shopName"
                type="text"
                {...register('shopName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.shopName && <p className="mt-1 text-xs text-red-500">{errors.shopName.message}</p>}
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={nextStep} className="rounded-md bg-brand-primary px-4 py-2 text-white font-semibold hover:bg-emerald-600">
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Bước 2: Địa chỉ lấy hàng</h3>
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">Người lấy hàng</label>
              <input
                id="recipientName"
                type="text"
                {...register('recipientName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.recipientName && <p className="mt-1 text-xs text-red-500">{errors.recipientName.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại lấy hàng</label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="provinceId" className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
              <input
                id="provinceId"
                type="text"
                {...register('provinceId')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.provinceId && <p className="mt-1 text-xs text-red-500">{errors.provinceId.message}</p>}
            </div>
            <div>
              <label htmlFor="wardID" className="block text-sm font-medium text-gray-700">Phường/Xã</label>
              <input
                id="wardID"
                type="text"
                {...register('wardID')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.wardID && <p className="mt-1 text-xs text-red-500">{errors.wardID.message}</p>}
            </div>
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể (số nhà, tên đường)</label>
              <input
                id="street"
                type="text"
                {...register('street')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100">
                Quay lại
              </button>
              <button type="button" onClick={nextStep} className="rounded-md bg-brand-primary px-4 py-2 text-white font-semibold hover:bg-emerald-600">
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-dark">Bước 3: Tài khoản nhận tiền</h3>
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
              <input
                id="bankName"
                type="text"
                {...register('bankName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.bankName && <p className="mt-1 text-xs text-red-500">{errors.bankName.message}</p>}
            </div>
            <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">Số tài khoản</label>
              <input
                id="bankAccount"
                type="text"
                {...register('bankAccount')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.bankAccount && <p className="mt-1 text-xs text-red-500">{errors.bankAccount.message}</p>}
            </div>
            <div>
              <label htmlFor="bankOwner" className="block text-sm font-medium text-gray-700">Tên chủ tài khoản</label>
              <input
                id="bankOwner"
                type="text"
                {...register('bankOwner')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
              />
              {errors.bankOwner && <p className="mt-1 text-xs text-red-500">{errors.bankOwner.message}</p>}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={prevStep} className="rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100">
                Quay lại
              </button>
              <button type="submit" className="rounded-md bg-brand-primary px-6 py-2 text-white font-semibold hover:bg-emerald-600">
                Hoàn tất đăng ký
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
```

Tạo page `website/client/app/(public)/shop/register/page.tsx`:
Create: `website/client/app/(public)/shop/register/page.tsx`
```tsx
import React from 'react';
import RegisterShopWizard from '@/features/shop/components/RegisterShopWizard';

export default function RegisterShopPage() {
  return (
    <div className="flex-1 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-dark sm:text-4xl">Đăng ký trở thành Người Bán</h2>
          <p className="mt-4 text-lg text-gray-500">Mở rộng kinh doanh cùng hệ sinh thái thương mại điện tử PixelMart.</p>
        </div>
        <RegisterShopWizard />
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
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add features/shop/schemas/shop.schema.ts features/shop/components/RegisterShopWizard.tsx app/\(public\)/shop/register/page.tsx features/shop/tests/RegisterShopWizard.test.tsx
git commit -m "feat(client): refactor shop registration wizard to clean page and dedicated schema"
```
