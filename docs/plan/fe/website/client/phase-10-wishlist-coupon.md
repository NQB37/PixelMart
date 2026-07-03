# Phase 10: Wishlist & Coupon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai chức năng danh sách yêu thích (Wishlist) kèm nút bấm icon Trái tim toggle và ô áp dụng mã giảm giá (Coupon/Discount Code) trực tiếp tại trang Thanh toán.

**Architecture:** Nút Trái tim `WishlistToggle` gọi API `POST /wishlist/toggle` để thêm hoặc xóa sản phẩm khỏi danh sách yêu thích trên DB. Trang `/wishlist` hiển thị danh sách sản phẩm yêu thích được kết xuất động. Tại Checkout, thành phần `CouponInput` cho phép gửi mã giảm giá lên API `/coupons/validate` để kiểm tra tính hợp lệ và cập nhật lại tổng tiền giảm giá trên client.

**Tech Stack:** React 19, Zustand, Axios API Client, Jest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 10.1: Wishlist Heart Icon Toggle and Dashboard Page

**Files:**
- Create: `website/client/features/wishlist/components/WishlistToggle.tsx`, `website/client/app/(public)/wishlist/page.tsx`
- Test: `website/client/features/wishlist/__tests__/WishlistToggle.test.tsx`

**Interfaces:**
- Consumes: Product ID
- Produces: Thành phần toggle Trái tim đính kèm Card sản phẩm và trang quản lý danh sách sản phẩm yêu thích.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra thay đổi icon trái tim dựa trên status wishlist:
Create: `website/client/features/wishlist/__tests__/WishlistToggle.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WishlistToggle from '../components/WishlistToggle';

// Mock shared-web
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        inWishlist: true,
      },
    }),
  },
}));

describe('WishlistToggle Component', () => {
  it('renders heart icon and updates fill state on click', async () => {
    render(<WishlistToggle productId="p1" initialStatus={false} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('♡'); // Empty heart

    fireEvent.click(btn);

    await waitFor(() => {
      expect(btn).toHaveTextContent('♥'); // Filled heart
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
Expected: FAIL do chưa tạo component `WishlistToggle.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Component WishlistToggle:
Create: `website/client/features/wishlist/components/WishlistToggle.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface WishlistToggleProps {
  productId: string;
  initialStatus: boolean;
}

export default function WishlistToggle({ productId, initialStatus }: WishlistToggleProps) {
  const [inWishlist, setInWishlist] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/wishlist/toggle', { productId });
      if (response.data && response.data.success) {
        setInWishlist(response.data.inWishlist);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none transition-colors"
    >
      <span className={`text-xl ${inWishlist ? 'text-red-500' : 'text-gray-400'}`}>
        {inWishlist ? '♥' : '♡'}
      </span>
    </button>
  );
}
```

Tạo page `website/client/app/(public)/wishlist/page.tsx`:
Create: `website/client/app/(public)/wishlist/page.tsx`
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProductCard, { Product } from '../../features/product/components/ProductCard';
import { api } from '@/lib/api';

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get('/wishlist');
        if (response.data && response.data.success) {
          setItems(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist items');
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Sản phẩm yêu thích</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">Danh sách yêu thích trống.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
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
Expected: PASS WishlistToggle.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/wishlist/components/WishlistToggle.tsx app/\(storefront\)/wishlist/page.tsx features/wishlist/__tests__/WishlistToggle.test.tsx
git commit -m "feat(client): implement Wishlist heart toggle icon and list board page"
```

---

### Task 10.2: Checkout Discount Coupon Input

**Files:**
- Create: `website/client/features/checkout/components/CouponInput.tsx`
- Modify: `website/client/features/checkout/components/CheckoutForm.tsx:28-52`
- Test: `website/client/features/checkout/__tests__/CouponInput.test.tsx`

**Interfaces:**
- Consumes: API endpoints `/coupons/validate`
- Produces: Component `CouponInput` kết nối vào trang thanh toán cho phép giảm trừ trực tiếp số tiền.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra nhập mã coupon và nhận phản hồi thành công/thất bại:
Create: `website/client/features/checkout/__tests__/CouponInput.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponInput from '../components/CouponInput';

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          code: 'DISCOUNT10',
          discountAmount: 50000,
        },
      },
    }),
  },
}));

describe('CouponInput Component', () => {
  it('applies coupon code and triggers callback on success', async () => {
    const handleApply = vi.fn();
    render(<CouponInput totalAmount={500000} onApplyCoupon={handleApply} />);
    
    const input = screen.getByPlaceholderText('Nhập mã giảm giá');
    const applyBtn = screen.getByRole('button', { name: 'Áp dụng' });

    fireEvent.change(input, { target: { value: 'DISCOUNT10' } });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith(50000, 'DISCOUNT10');
      expect(screen.getByText('Áp dụng mã giảm giá thành công!')).toBeInTheDocument();
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
Expected: FAIL do chưa tạo component `CouponInput.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Component CouponInput:
Create: `website/client/features/checkout/components/CouponInput.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface CouponInputProps {
  totalAmount: number;
  onApplyCoupon: (discountAmount: number, code: string) => void;
}

export default function CouponInput({ totalAmount, onApplyCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApply = async () => {
    if (!code) return;
    try {
      const response = await api.post('/coupons/validate', { code, totalAmount });
      if (response.data && response.data.success) {
        const { discountAmount } = response.data.data;
        onApplyCoupon(discountAmount, code);
        setIsSuccess(true);
        setMessage('Áp dụng mã giảm giá thành công!');
      }
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'Mã giảm giá không hợp lệ.');
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập mã giảm giá"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={handleApply}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Áp dụng
        </button>
      </div>
      {message && (
        <p className={`text-xs ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}>{message}</p>
      )}
    </div>
  );
}
```

Cập nhật `CheckoutForm.tsx` để tích hợp `CouponInput`:
Modify: `website/client/features/checkout/components/CheckoutForm.tsx:28-52` (Target the form submission modification for coupon code)
Replace the handleSubmit section:
```typescript
  const [couponCode, setCouponCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;
    try {
      const response = await api.post('/orders', {
        ...data,
        couponCode,
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
```
(Include `CouponInput` below checkout summaries in JSX to update discount state).

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS CouponInput.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/checkout/components/CouponInput.tsx features/checkout/components/CheckoutForm.tsx features/checkout/__tests__/CouponInput.test.tsx
git commit -m "feat(client): integrate CouponInput coupon codes validation inside checkout form flow"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Lạm dụng Client-side Discount Calculation**: Tự động tính toán số tiền giảm giá và trừ thẳng ở phía client trước khi gửi lên API tạo order mà không truyền mã code. Backend bắt buộc phải nhận `couponCode` và tự kiểm tra tính hợp lệ độc lập để tránh bị hack tiền.
2. **Không xử lý toggle spam**: Click liên tiếp vào icon trái tim khi request đang xử lý (loading) dẫn đến gửi dồn dập nhiều API request tạo/xóa liên tiếp. Luôn đặt `disabled={isLoading}` trong lúc chờ response.

### Checklist Cuối Phase
- [ ] Bấm Trái tim chuyển đổi icon rỗng/đầy tương ứng trạng thái thực tế.
- [ ] Trang sản phẩm yêu thích `/wishlist` tải danh sách chính xác từ API.
- [ ] Nhập mã coupon không hợp lệ trả thông báo đỏ dưới input.
- [ ] Áp dụng mã hợp lệ giảm trừ số tiền thanh toán thực tế và gửi kèm mã lên payload order.
- [ ] Bộ test suite hoàn toàn PASS.
