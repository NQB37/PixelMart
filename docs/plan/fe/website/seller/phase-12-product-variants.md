# Kênh Người Bán - Phase 12: Product Variants Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp tính năng quản lý biến thể (Attributes & Variants) cho sản phẩm vào component `ProductForm` thuộc `/features/products/components/`.

**Architecture:** 
- Chỉnh sửa trực tiếp component `website/seller/src/features/products/components/ProductForm.tsx` để nhúng các component quản lý thuộc tính (`AttributeSelector`) và danh sách biến thể (`VariantsTable`).
- Giữ nguyên các files pages cực kỳ sạch sẽ.

**Tech Stack:** React 18, React Router v6, Axios, Vitest, React Testing Library.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. Chưa có `features/products` nên chưa có `ProductForm` / `AttributeSelector` / `VariantsTable`; backend cũng chưa có API sản phẩm/biến thể.

---

## 📋 Task Breakdown

### Task 1: Attribute Selection UI Component

**Files:**
- Create: `website/seller/src/components/products/AttributeSelector.tsx`
- Test: `website/seller/src/tests/attributeSelector.test.tsx`

- [ ] **Step 3: Implementation**
...
(Attribute Selector logic and UI)

---

### Task 2: Variants Table Management UI

**Files:**
- Create: `website/seller/src/components/products/VariantsTable.tsx`
- Modify: `website/seller/src/features/products/components/ProductForm.tsx`
- Test: `website/seller/src/tests/variantsTable.test.tsx`

- [ ] **Step 3: Integrate with ProductForm component**
Cập nhật `website/seller/src/features/products/components/ProductForm.tsx` tích hợp cả `AttributeSelector` lẫn `VariantsTable` bên dưới thông số chính.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/products/VariantsTable.tsx website/seller/src/features/products/components/ProductForm.tsx website/seller/src/tests/variantsTable.test.tsx
git commit -m "feat(seller): integrate variants and attributes manager UI into feature ProductForm"
```
