# Phase 09: Reviews & Ratings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai tính năng đánh giá sản phẩm (Reviews & Ratings) với validation schema được tách rời hoàn toàn tại `features/product/schemas/review.schema.ts`.

**Architecture:** 
- Schema Zod nằm độc lập tại `features/product/schemas/review.schema.ts`.
- Component `WriteReviewForm` quản lý form review, star rating và Cloudinary image upload.
- Component `ProductReviewsList` hiển thị danh sách đánh giá từ server.

**Tech Stack:** React 19, Zod, Axios client, Vitest.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. Backend review/rating API và feature `products` phía client đều chưa tồn tại.

## Global Constraints
- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand

---

### Task 9.1: Write Review Form with Star Rating and Image Upload

**Files:**
- Create: `website/client/features/product/schemas/review.schema.ts`
- Create: `website/client/features/product/components/WriteReviewForm.tsx`
- Test: `website/client/features/product/tests/WriteReviewForm.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/client/features/product/tests/WriteReviewForm.test.tsx`
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriteReviewForm from '../components/WriteReviewForm';

describe('WriteReviewForm Component', () => {
  it('shows error when comment is empty on submit', async () => {
    const handleSuccess = vi.fn();
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
Run: `pnpm test`
Expected: FAIL do chưa tạo component `WriteReviewForm.tsx`.

- [ ] **Step 3: Write minimal implementation**
Tạo Schema validation:
Create: `website/client/features/product/schemas/review.schema.ts`
```typescript
import * as z from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Chưa chọn điểm đánh giá').max(5),
  comment: z.string().min(5, 'Bình luận tối thiểu 5 ký tự'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
```

Tạo component WriteReviewForm:
Create: `website/client/features/product/components/WriteReviewForm.tsx`
```tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { reviewSchema, ReviewFormValues } from '../schemas/review.schema';

export default function WriteReviewForm({ productId, onSuccess }: { productId: string, onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const response = await api.post('/reviews', { productId, rating, comment: data.comment, images });
      if (response.data && response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 border rounded bg-white">
      <textarea {...register('comment')} className="w-full border p-2" />
      {errors.comment && <p className="text-red-500 text-xs">{errors.comment.message}</p>}
      <button type="submit" className="bg-brand-primary text-white p-2 rounded">Gửi đánh giá</button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**
Run:
```bash
git add features/product/schemas/review.schema.ts features/product/components/WriteReviewForm.tsx features/product/tests/WriteReviewForm.test.tsx
git commit -m "feat(client): refactor write review form to use separated schema file"
```
