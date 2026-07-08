# Kênh Người Bán - Phase 5: Product CRUD Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng quản lý sản phẩm (CRUD) cho người bán sử dụng cấu trúc Page sạch, tách biệt logic Form, danh sách và Zod schema sang thư mục `/features/products/`.

**Architecture:** 
- Trang `pages/Products.tsx` và `ProductForm.tsx` chỉ đóng vai trò làm router entry point sạch.
- Validation Schema được tách biệt hoàn toàn tại `features/products/schemas/product.schema.ts`.
- Logic & UI chứa trong các component `ProductList.tsx` và `ProductForm.tsx` của feature.

**Tech Stack:** React 18, React Router v6, Zod, Axios, Vitest, React Testing Library.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. App `seller` chưa có `features/products` (mới có `features/auth` + `features/shop`), và backend cũng chưa có API sản phẩm.

---

## 📋 Task Breakdown

### Task 1: Trang Danh sách sản phẩm (Products List)

**Files:**
- Create: `website/seller/src/features/products/components/ProductList.tsx`
- Create: `website/seller/src/pages/Products.tsx`
- Test: `website/seller/src/features/products/tests/ProductList.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/features/products/tests/ProductList.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductList from '../components/ProductList';
import { MemoryRouter } from 'react-router-dom';

describe('ProductList Component', () => {
  it('renders product search box', () => {
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Tìm theo tên sản phẩm/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
Tạo component ProductList:
Create: `website/seller/src/features/products/components/ProductList.tsx`
```typescript
import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function ProductList() {
  const [search, setSearch] = useState('');
  return (
    <div className="p-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm hoặc SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-slate-800"
        />
      </div>
    </div>
  );
}
```

Tạo Page sạch:
Create: `website/seller/src/pages/Products.tsx`
```typescript
import React from 'react';
import ProductList from '../features/products/components/ProductList';

export default function Products() {
  return <ProductList />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/features/products/components/ProductList.tsx website/seller/src/pages/Products.tsx website/seller/src/features/products/tests/ProductList.test.tsx
git commit -m "feat(seller): refactor product list to clean page wrapper"
```

---

### Task 2: Form Tạo mới/Chỉnh sửa sản phẩm có Xác thực dữ liệu

**Files:**
- Create: `website/seller/src/features/products/schemas/product.schema.ts`
- Create: `website/seller/src/features/products/components/ProductForm.tsx`
- Create: `website/seller/src/pages/ProductForm.tsx`
- Test: `website/seller/src/features/products/tests/ProductForm.test.tsx`

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/features/products/tests/ProductForm.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductForm from '../components/ProductForm';
import { MemoryRouter } from 'react-router-dom';

describe('ProductForm validation rules', () => {
  it('triggers error validation messages for invalid data fields', async () => {
    render(
      <MemoryRouter>
        <ProductForm />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /lưu sản phẩm/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('Tên sản phẩm phải từ 3 ký tự trở lên')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
Tạo Zod Schema:
Create: `website/seller/src/features/products/schemas/product.schema.ts`
```typescript
import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải từ 3 ký tự trở lên'),
  sku: z.string().min(1, 'Mã SKU không được để trống'),
  price: z.number().positive('Giá bán phải lớn hơn 0'),
  comparePrice: z.number().optional(),
  stock: z.number().nonnegative('Số lượng kho không được nhỏ hơn 0'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục sản phẩm'),
  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

Tạo component ProductForm:
Create: `website/seller/src/features/products/components/ProductForm.tsx`
```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '../schemas/product.schema';
import { Save } from 'lucide-react';

export default function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Tên sản phẩm *</label>
        <input id="name" type="text" {...register('name')} className="w-full p-2 border text-slate-800" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="sku" className="block text-sm font-semibold text-slate-700">SKU *</label>
        <input id="sku" type="text" {...register('sku')} className="w-full p-2 border text-slate-800" />
        {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-semibold text-slate-700">Giá bán *</label>
        <input id="price" type="number" {...register('price', { valueAsNumber: true })} className="w-full p-2 border text-slate-800" />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-semibold text-slate-700">Số lượng kho *</label>
        <input id="stock" type="number" {...register('stock', { valueAsNumber: true })} className="w-full p-2 border text-slate-800" />
        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold text-slate-700">Danh mục *</label>
        <select id="categoryId" {...register('categoryId')} className="w-full p-2 border text-slate-800">
          <option value="">Chọn danh mục</option>
          <option value="cat1">Điện tử</option>
        </select>
        {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
      </div>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center gap-2">
        <Save className="h-4 w-4" /> Lưu sản phẩm
      </button>
    </form>
  );
}
```

Tạo Page sạch:
Create: `website/seller/src/pages/ProductForm.tsx`
```typescript
import React from 'react';
import ProductForm from '../features/products/components/ProductForm';

export default function ProductFormPage() {
  return <ProductForm />;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/features/products/schemas/product.schema.ts website/seller/src/features/products/components/ProductForm.tsx website/seller/src/pages/ProductForm.tsx website/seller/src/features/products/tests/ProductForm.test.tsx
git commit -m "feat(seller): refactor product form to clean page and separate validation schema"
```
