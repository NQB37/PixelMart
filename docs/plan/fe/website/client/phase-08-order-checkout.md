# Phase 08: Order & Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang Thanh toán (Checkout) với Form địa chỉ giao hàng, lựa chọn phương thức thanh toán (COD, VNPAY, Stripe), xử lý chuyển hướng cổng thanh toán, trang xác nhận kết quả (Return handler), và trang Lịch sử đơn hàng.

**Architecture:** Khi submit form thanh toán, frontend gửi request tạo đơn hàng lên API `/orders`. Nếu phương thức thanh toán là VNPAY hoặc Stripe, API trả về URL thanh toán; frontend sử dụng `window.location.replace` để chuyển hướng. Sau khi hoàn thành, cổng thanh toán redirect về `/checkout/payment-return` nơi frontend gửi query params lên backend để verify trạng thái đơn hàng.

**Tech Stack:** React Hook Form, Axios API Client, Next.js dynamic routing, Jest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 8.1: Checkout Form and Payment Method Selector

**Files:**
- Create: `website/client/features/checkout/components/CheckoutForm.tsx`, `website/client/app/(public)/checkout/page.tsx`
- Test: `website/client/features/checkout/__tests__/CheckoutForm.test.tsx`

**Interfaces:**
- Consumes: Zustand `cartStore` items list
- Produces: Form Checkout hoàn chỉnh thu thập thông tin người nhận và điều hướng thanh toán.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm thử validation địa chỉ và kích hoạt submit đơn hàng:
Create: `website/client/features/checkout/__tests__/CheckoutForm.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutForm from '../components/CheckoutForm';

// Mock useRouter
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
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo component `CheckoutForm.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo component CheckoutForm:
Create: `website/client/features/checkout/components/CheckoutForm.tsx`
```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '../../stores/cartStore';
import { api } from '@/lib/api';

const checkoutSchema = z.object({
  recipientName: z.string().min(1, 'Họ tên người nhận là bắt buộc'),
  phone: z.string().regex(/^\d{10,11}$/, 'Số điện thoại giao hàng là bắt buộc'),
  street: z.string().min(5, 'Địa chỉ giao hàng tối thiểu 5 ký tự'),
  provinceId: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  wardID: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  paymentMethod: z.enum(['COD', 'VNPAY', 'STRIPE']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-brand-dark">Phương thức thanh toán</h3>
        <div className="space-y-2">
          {['COD', 'VNPAY', 'STRIPE'].map((method) => (
            <label key={method} className="flex items-center gap-3 p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value={method}
                {...register('paymentMethod')}
                className="text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm font-medium text-gray-900">{method}</span>
            </label>
          ))}
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
import CheckoutForm from '../../../features/checkout/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <CheckoutForm />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-brand-dark mb-4">Tóm tắt đơn hàng</h3>
          <p className="text-sm text-gray-500">Giỏ hàng và tổng tiền được đồng bộ trực tiếp từ giỏ hàng hiện tại.</p>
        </div>
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
Expected: PASS CheckoutForm.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/checkout/components/CheckoutForm.tsx app/\(storefront\)/checkout/page.tsx features/checkout/__tests__/CheckoutForm.test.tsx
git commit -m "feat(client): develop CheckoutForm with delivery address validation and payment strategies integration"
```

---

### Task 8.2: Payment Return Hook and Handler Page

**Files:**
- Create: `website/client/app/(public)/checkout/payment-return/page.tsx`
- Test: `website/client/app/(public)/checkout/payment-return/__tests__/PaymentReturn.test.tsx`

**Interfaces:**
- Consumes: URL query parameters
- Produces: UI và logic phân tích kết quả giao dịch thanh toán trực tuyến.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra render thông tin thanh toán thành công hay thất bại dựa trên searchParams:
Create: `website/client/app/(public)/checkout/payment-return/__tests__/PaymentReturn.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentReturnPage from '../page';

// Mock shared-web
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        success: true,
        message: 'Thanh toán thành công',
      },
    }),
  },
}));

describe('Payment Return Page', () => {
  it('renders success status when query status is success', async () => {
    const searchParams = Promise.resolve({ vnp_ResponseCode: '00' });
    const jsx = await PaymentReturnPage({ searchParams });
    render(jsx);

    expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo page `payment-return/page.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo page `website/client/app/(public)/checkout/payment-return/page.tsx`:
Create: `website/client/app/(public)/checkout/payment-return/page.tsx`
```tsx
import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function verifyPayment(params: { [key: string]: string | undefined }) {
  try {
    const response = await api.get('/payments/verify', { params });
    if (response.data && response.data.success) {
      return { isSuccess: true, message: 'Thanh toán thành công!' };
    }
  } catch (error) {
    console.error('Payment verification failed', error);
  }
  return { isSuccess: false, message: 'Thanh toán thất bại hoặc đã bị hủy.' };
}

export default async function PaymentReturnPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const result = await verifyPayment(resolvedParams);

  return (
    <div className="mx-auto max-w-md bg-white p-8 rounded-xl shadow-md my-16 text-center">
      {result.isSuccess ? (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl text-emerald-600">✓</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-brand-dark">Thanh toán thành công!</h2>
          <p className="mt-2 text-sm text-gray-500">Đơn hàng của bạn đang được shop xử lý.</p>
        </div>
      ) : (
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl text-red-600">✗</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-brand-dark">Thanh toán thất bại</h2>
          <p className="mt-2 text-sm text-gray-500">{result.message}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/orders" className="w-full rounded-md bg-brand-primary py-2 text-white font-semibold hover:bg-emerald-600">
          Xem lịch sử đơn hàng
        </Link>
        <Link href="/" className="w-full rounded-md border border-gray-300 py-2 text-gray-700 font-semibold hover:bg-gray-50">
          Về Trang chủ
        </Link>
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
Expected: PASS PaymentReturn.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add app/\(storefront\)/checkout/payment-return/page.tsx app/\(storefront\)/checkout/payment-return/__tests__/PaymentReturn.test.tsx
git commit -m "feat(client): implement VNPAY/Stripe return handler verification page"
```

---

### Task 8.3: Order History Page

**Files:**
- Create: `website/client/app/(public)/orders/page.tsx`, `website/client/features/order/components/OrderHistoryList.tsx`
- Test: `website/client/features/order/__tests__/OrderHistoryList.test.tsx`

**Interfaces:**
- Consumes: Backend API `/orders`
- Produces: Trang hiển thị toàn bộ lịch sử đặt hàng của Buyer.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra khả năng render danh sách đơn hàng:
Create: `website/client/features/order/__tests__/OrderHistoryList.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderHistoryList from '../components/OrderHistoryList';

describe('OrderHistoryList Component', () => {
  const mockOrders = [
    { id: 'o1', orderNumber: 'ORD-12345', totalPrice: 200000, status: 'PENDING', createdAt: '2026-06-24' }
  ];

  it('renders history orders list correctly', () => {
    render(<OrderHistoryList orders={mockOrders} />);
    expect(screen.getByText('ORD-12345')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo component `OrderHistoryList.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Component OrderHistoryList:
Create: `website/client/features/order/components/OrderHistoryList.tsx`
```tsx
import React from 'react';

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function OrderHistoryList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice);
        return (
          <div key={order.id} className="flex items-center justify-between border border-gray-200 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-sm font-semibold text-brand-primary">{price}</p>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                {order.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

Tạo page `website/client/app/(public)/orders/page.tsx`:
Create: `website/client/app/(public)/orders/page.tsx`
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import OrderHistoryList, { Order } from '../../../features/order/components/OrderHistoryList';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        if (response.data && response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch orders history');
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Lịch sử mua hàng</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <OrderHistoryList orders={orders} />
      )}
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
Expected: PASS OrderHistoryList.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add app/\(storefront\)/orders/page.tsx features/order/components/OrderHistoryList.tsx features/order/__tests__/OrderHistoryList.test.tsx
git commit -m "feat(client): construct OrderHistoryList dashboard page for registered buyers"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Dùng state lưu giữ redirect url thanh toán**: Khi click thanh toán, chuyển hướng bằng `window.location.href` khiến toàn bộ React state hiện tại bị hủy. Tránh dựa vào local state để kiểm tra kết quả giao dịch mà bắt buộc phải đọc từ query searchParams lúc redirect quay lại.
2. **Không xử lý checkout giỏ hàng trống**: Cho phép user click thanh toán kể cả khi `cartItems` trống rỗng. Luôn thêm điều kiện disable button thanh toán hoặc cảnh báo nếu giỏ hàng bằng không.

### Checklist Cuối Phase
- [ ] Màn hình Checkout hiển thị chính xác tổng tiền và thông tin giao nhận.
- [ ] Chọn VNPAY/Stripe chuyển hướng sang cổng thanh toán thành công (không báo lỗi undefined URL).
- [ ] Quay về trang `/checkout/payment-return` hiển thị thông báo trạng thái chính xác.
- [ ] Lịch sử đơn hàng tải danh sách đơn và hiển thị đúng status.
- [ ] Toàn bộ unit tests của order và checkout hoàn thành thành công.
