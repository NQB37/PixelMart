# Phase 09: Reviews & Ratings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai tính năng đánh giá sản phẩm (Reviews & Ratings) gồm form gửi đánh giá (chọn số sao, viết bình luận, upload hình ảnh) và danh sách hiển thị các review của sản phẩm.

**Architecture:** Tạo sub-component `WriteReviewForm` quản lý nhập liệu đánh giá. Đối với hình ảnh đính kèm, frontend sử dụng endpoint `/upload` để upload ảnh lên Cloudinary và lấy về URL bảo mật, sau đó gửi payload chứa các URL này cùng với nội dung đánh giá lên API `/reviews`. Component `ProductReviewsList` hiển thị danh sách đánh giá từ server.

**Tech Stack:** React 19, Zod (Form validation), Axios client, Jest.

## Global Constraints

- Client web portal is located at `web/client-web/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 9.1: Write Review Form with Star Rating and Image Upload

**Files:**
- Create: `web/client-web/features/product/components/WriteReviewForm.tsx`
- Test: `web/client-web/features/product/__tests__/WriteReviewForm.test.tsx`

**Interfaces:**
- Consumes: Product ID
- Produces: Form `WriteReviewForm` cho phép người dùng chấm điểm sao, chọn file ảnh, upload và submit đánh giá.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm thử chọn số sao và validate bình luận trống:
Create: `web/client-web/features/product/__tests__/WriteReviewForm.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriteReviewForm from '../components/WriteReviewForm';

describe('WriteReviewForm Component', () => {
  it('shows error when comment is empty on submit', async () => {
    const handleSuccess = jest.fn();
    render(<WriteReviewForm productId="p1" onSuccess={handleSuccess} />);
    
    const submitBtn = screen.getByRole('button', { name: 'Gửi đánh giá' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Bình luận tối thiểu 5 ký tự')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do chưa tạo component `WriteReviewForm.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo component WriteReviewForm:
Create: `web/client-web/features/product/components/WriteReviewForm.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@pixelmart/shared-web';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Chưa chọn điểm đánh giá').max(5),
  comment: z.string().min(5, 'Bình luận tối thiểu 5 ký tự'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface WriteReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

export default function WriteReviewForm({ productId, onSuccess }: WriteReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data && res.data.success) {
          uploadedUrls.push(res.data.data.url);
        }
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Image upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const response = await api.post('/reviews', {
        productId,
        rating: data.rating,
        comment: data.comment,
        images,
      });
      if (response.data && response.data.success) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to submit review', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="text-lg font-bold text-brand-dark">Viết đánh giá của bạn</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Chấm điểm sao</label>
        <div className="flex gap-2 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Nội dung đánh giá</label>
        <textarea
          id="comment"
          rows={3}
          {...register('comment')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none"
        />
        {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Hình ảnh sản phẩm (tùy chọn)</label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-brand-primary hover:file:bg-gray-200"
        />
        {isUploading && <p className="text-xs text-gray-500 mt-1">Đang upload ảnh...</p>}
        <div className="flex gap-2 mt-2">
          {images.map((url, idx) => (
            <img key={idx} src={url} alt="Review product" className="h-16 w-16 object-cover rounded-md border" />
          ))}
        </div>
      </div>

      <button type="submit" className="rounded-md bg-brand-primary px-4 py-2 text-white font-semibold hover:bg-emerald-600">
        Gửi đánh giá
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS WriteReviewForm.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/product/components/WriteReviewForm.tsx features/product/__tests__/WriteReviewForm.test.tsx
git commit -m "feat(client-web): construct WriteReviewForm component with star selection and file uploader"
```

---

### Task 9.2: Product Reviews List Component

**Files:**
- Create: `web/client-web/features/product/components/ProductReviewsList.tsx`
- Test: `web/client-web/features/product/__tests__/ProductReviewsList.test.tsx`

**Interfaces:**
- Consumes: List of reviews objects
- Produces: UI component hiển thị mảng đánh giá sản phẩm.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra khả năng render danh sách review:
Create: `web/client-web/features/product/__tests__/ProductReviewsList.test.tsx`
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductReviewsList from '../components/ProductReviewsList';

describe('ProductReviewsList Component', () => {
  const mockReviews = [
    { id: 'r1', rating: 4, comment: 'Sản phẩm rất tốt, giao hàng nhanh', user: { name: 'Alice' }, images: [], createdAt: '2026-06-24' }
  ];

  it('renders reviews correctly with star ratings', () => {
    render(<ProductReviewsList reviews={mockReviews} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Sản phẩm rất tốt, giao hàng nhanh')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: FAIL do chưa tạo component `ProductReviewsList.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo component ProductReviewsList:
Create: `web/client-web/features/product/components/ProductReviewsList.tsx`
```tsx
import React from 'react';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  images: string[];
  createdAt: string;
}

export default function ProductReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-brand-dark border-b pb-2">Đánh giá từ khách hàng</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{review.user.name}</p>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-sm ${review.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((url, idx) => (
                    <img key={idx} src={url} alt="Review attachment" className="h-16 w-16 object-cover rounded-md border" />
                  ))}
                </div>
              )}
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
cd /home/nquocbao37/Code/PixelMart/web/client-web
npm run test
```
Expected: PASS ProductReviewsList.test.tsx

- [ ] **Step 5: Commit**
Run:
```bash
git add features/product/components/ProductReviewsList.tsx features/product/__tests__/ProductReviewsList.test.tsx
git commit -m "feat(client-web): implement ProductReviewsList component to render client ratings"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Gửi File raw thay vì URL ảnh**: Trực tiếp gửi file Binary của ảnh vào payload tạo review thay vì upload lên storage trước lấy link. API DB chỉ lưu trữ URL text, do đó upload ảnh bắt buộc phải là luồng tách biệt.
2. **Không đồng bộ lại Reviews List sau khi Submit**: Gửi review thành công nhưng danh sách review không tự reload, khiến user tưởng chưa gửi được. Phải gọi callback `onSuccess` để parent component fetch lại data.

### Checklist Cuối Phase
- [ ] Giao diện chấm sao trực quan, hover hoặc click thay đổi trạng thái sao hiển thị chính xác.
- [ ] Tính năng upload ảnh hoạt động tốt, hiển thị preview thumbnail ngay dưới form.
- [ ] Submit review thành công gọi API reload danh sách review mà không cần reload trang.
- [ ] Unit tests chạy qua mà không lỗi mock.
