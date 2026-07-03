# Phase 08: Order & Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang Thanh toán (Checkout) với cấu trúc Page cực kỳ sạch sẽ, tách biệt schema validate Zod tại `schemas/checkout.schema.ts` và logic Form tại `components/CheckoutForm.tsx`.

**Architecture:** 
- Routing Pages (`app/(public)/checkout/page.tsx`, `orders/page.tsx`) đóng vai trò là entry points sạch.
- Schema Zod nằm tại `features/checkout/schemas/checkout.schema.ts`.
- Form Presentation & Logic nằm tại `features/checkout/components/CheckoutForm.tsx`.
- Giao tiếp với API `/orders` và redirect URL thanh toán (VNPAY / Stripe) được xử lý bên trong Component.

**Tech Stack:** React Hook Form, Zod, Axios API Client, Next.js dynamic routing, Vitest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.

---

### Task 8.1: Checkout Form and Payment Method Selector

**Files:**
- Create: `website/client/features/checkout/schemas/checkout.schema.ts`
- Create: `website/client/features/checkout/components/CheckoutForm.tsx`
- Create: `website/client/app/(public)/checkout/page.tsx`
- Test: `website/client/features/checkout/__tests__/CheckoutForm.test.tsx`

**Interfaces:**
- Consumes: Zustand `cartStore` items list
- Produces: Form Checkout hoàn chỉnh thu thập thông tin người nhận và điều hướng thanh toán.

- [ ] **Step 1: Write the failing test**
Create: `website/client/features/checkout/__tests__/CheckoutForm.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutForm from '../components/CheckoutForm';

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

describe('Checkout Form', () => {
  it('displays validation messages for missing delivery address and phone', async () => {
    render(<CheckoutForm />);
    const submitBtn = screen.getByRole('button', { name: 'Thanh toán ngay' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Họ tên người nhận là bắt buộc')).toBeInTheDocument();
      expect(screen.getByText('Số điện thoại giao hàng là bắt buộc')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm test`
Expected: FAIL do chưa tạo component `CheckoutForm.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Schema validation:
Create: `website/client/features/checkout/schemas/checkout.schema.ts`
```typescript
import * as z from 'zod';

export const checkoutSchema = z.object({
  recipientName: z.string().min(1, 'Họ tên người nhận là bắt buộc'),
  phone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại giao hàng là bắt buộc'),
  street: z.string().min(5, 'Địa chỉ giao hàng tối thiểu 5 ký tự'),
  provinceId: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  wardID: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  paymentMethod: z.enum(['COD', 'VNPAY', 'STRIPE']),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
```

Tạo Component CheckoutForm:
Create: `website/client/features/checkout/components/CheckoutForm.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '../../stores/cartStore';
import { api } from '@/lib/api';
import { checkoutSchema, CheckoutFormValues } from '../schemas/checkout.schema';

export default function CheckoutForm() {
  const { items, clearCart } = useCartStore();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'COD',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;
    try {
      const response = await api.post('/orders', {
        ...data,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (response.data && response.data.success) {
        const { order, paymentUrl } = response.data.data;
        clearCart();
        if (paymentUrl) {
          window.location.replace(paymentUrl);
        } else {
          window.location.replace(`/orders/success?orderId=${order.id}`);
        }
      }
    } catch (err: any) {
      console.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-brand-dark">Thông tin giao hàng</h3>
        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">Họ tên người nhận</label>
          <input
            id="recipientName"
            type="text"
            {...register('recipientName')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
          />
          {errors.recipientName && <p className="mt-1 text-xs text-red-500">{errors.recipientName.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            id="phone"
            type="text"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể</label>
          <input
            id="street"
            type="text"
            {...register('street')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
          />
          {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
        </div>
      </div>
      <button type="submit" className="w-full rounded-md bg-brand-primary py-3 text-white font-semibold hover:bg-emerald-600 transition-colors">
        Thanh toán ngay
      </button>
    </form>
  );
}
```

Tạo page `website/client/app/(public)/checkout/page.tsx`:
Create: `website/client/app/(public)/checkout/page.tsx`
```tsx
import React from 'react';
import CheckoutForm from '@/features/checkout/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <CheckoutForm />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add features/checkout/schemas/checkout.schema.ts features/checkout/components/CheckoutForm.tsx app/\(public\)/checkout/page.tsx features/checkout/__tests__/CheckoutForm.test.tsx
git commit -m "feat(client): refactor checkout to clean page and dedicated validation schema"
```
