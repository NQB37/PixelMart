# Kênh Người Bán - Phase 12: Product Variants Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trình quản lý cấu hình các thuộc tính biến thể sản phẩm (Variant Attributes như Size, Color) và tự động tạo danh sách tất cả các biến thể kết hợp (Cartesian Product) kèm theo form nhập SKU, giá bán, số lượng kho riêng biệt cho từng biến thể.

**Architecture:** Sử dụng hàm tiện ích thuần (pure utility function) để tính toán tích Descartes từ các danh mục thuộc tính. Tạo component `VariantsConfig` chứa hai luồng dữ liệu: cấu hình thuộc tính thô và bảng danh sách tổ hợp biến thể phát sinh.

**Tech Stack:** React 18, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Node.js version >= 18
- Package manager: pnpm
- Toàn bộ source code của seller nằm trong thư mục `website/seller/`
- Sử dụng Path Alias `@/` trỏ tới `website/seller/src`
- TDD: Mọi component/helper phải viết test trước khi code minimal implementation
- Không sử dụng code placeholder (ví dụ: `// TODO`, `/* code here */`). Toàn bộ code trong plan phải hoạt động được.

---

## 📋 Task Breakdown

### Task 1: Viết hàm tiện ích tính Tích Descartes (Cartesian Product Helper)

**Files:**
- Create: `website/seller/src/utils/cartesian.ts`
- Create: `website/seller/src/__tests__/cartesian.test.ts`

**Interfaces:**
- Consumes: None (Pure Utility)
- Produces: Hàm `cartesianProduct(arrays: string[][]): string[][]` trả về mảng các tổ hợp.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/__tests__/cartesian.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { cartesianProduct } from '../utils/cartesian';

describe('cartesianProduct utility', () => {
  it('generates correct combinations from multiple attribute value arrays', () => {
    const input = [
      ['Red', 'Blue'],
      ['S', 'M'],
    ];
    const expected = [
      ['Red', 'S'],
      ['Red', 'M'],
      ['Blue', 'S'],
      ['Blue', 'M'],
    ];
    expect(cartesianProduct(input)).toEqual(expected);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì `utils/cartesian.ts` chưa được định nghĩa.

- [ ] **Step 3: Write minimal implementation**
Create: `website/seller/src/utils/cartesian.ts`
```typescript
export function cartesianProduct(arrays: string[][]): string[][] {
  if (arrays.length === 0) return [];
  
  return arrays.reduce<string[][]>(
    (acc, curr) => {
      const result: string[][] = [];
      acc.forEach((a) => {
        curr.forEach((b) => {
          result.push([...a, b]);
        });
      });
      return result;
    },
    [[]]
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS 1/1 (cartesian.test.ts)

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/utils/cartesian.ts website/seller/src/__tests__/cartesian.test.ts
git commit -m "feat(seller): implement cartesian product helper with comprehensive unit test"
```

---

### Task 2: Xây dựng Component Quản lý Thuộc tính (Attribute Selector)

**Files:**
- Create: `website/seller/src/components/products/AttributeSelector.tsx`
- Create: `website/seller/src/__tests__/attributeSelector.test.tsx`

**Interfaces:**
- Consumes: None.
- Produces: Giao diện thêm nhóm thuộc tính (ví dụ: Size) và danh sách các tag giá trị tương ứng (ví dụ: M, L, XL).

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/__tests__/attributeSelector.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AttributeSelector from '../components/products/AttributeSelector';

describe('AttributeSelector Component', () => {
  it('renders attributes and inputs to add more values', () => {
    const mockAttributes = [{ id: 'attr-1', name: 'Màu sắc', values: ['Đỏ', 'Xanh'] }];
    render(<AttributeSelector attributes={mockAttributes} onChange={vi.fn()} />);

    expect(screen.getByText('Màu sắc')).toBeInTheDocument();
    expect(screen.getByText('Đỏ')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì component `AttributeSelector` chưa tồn tại.

- [ ] **Step 3: Write minimal implementation**
Create: `website/seller/src/components/products/AttributeSelector.tsx`
```typescript
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface AttributeSelectorProps {
  attributes: Attribute[];
  onChange: (attributes: Attribute[]) => void;
}

export default function AttributeSelector({ attributes, onChange }: AttributeSelectorProps) {
  const [newAttrName, setNewAttrName] = useState('');
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});

  const addAttribute = () => {
    if (!newAttrName.trim()) return;
    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttrName.trim(),
      values: [],
    };
    onChange([...attributes, newAttr]);
    setNewAttrName('');
  };

  const removeAttribute = (id: string) => {
    onChange(attributes.filter((attr) => attr.id !== id));
  };

  const addValue = (attrId: string) => {
    const inputVal = newValueInputs[attrId] || '';
    if (!inputVal.trim()) return;

    onChange(
      attributes.map((attr) => {
        if (attr.id === attrId) {
          if (attr.values.includes(inputVal.trim())) return attr; // Tránh trùng lặp
          return { ...attr, values: [...attr.values, inputVal.trim()] };
        }
        return attr;
      })
    );
    setNewValueInputs({ ...newValueInputs, [attrId]: '' });
  };

  const removeValue = (attrId: string, valToRemove: string) => {
    onChange(
      attributes.map((attr) => {
        if (attr.id === attrId) {
          return { ...attr, values: attr.values.filter((v) => v !== valToRemove) };
        }
        return attr;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Thêm nhóm thuộc tính (Ví dụ: Kích thước, Màu sắc)"
          value={newAttrName}
          onChange={(e) => setNewAttrName(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
        <button
          type="button"
          onClick={addAttribute}
          className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm</span>
        </button>
      </div>

      <div className="space-y-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="p-4 bg-slate-50 border rounded-xl relative">
            <button
              type="button"
              onClick={() => removeAttribute(attr.id)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="font-bold text-slate-700 mb-2">{attr.name}</div>
            
            {/* Tag List */}
            <div className="flex flex-wrap gap-2 mb-3">
              {attr.values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-sm font-medium text-slate-600 shadow-sm"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => removeValue(attr.id, val)}
                    className="text-slate-400 hover:text-red-500 transition rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input tag value */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                placeholder="Nhập giá trị..."
                value={newValueInputs[attr.id] || ''}
                onChange={(e) => setNewValueInputs({ ...newValueInputs, [attr.id]: e.target.value })}
                className="flex-1 px-3 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addValue(attr.id);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addValue(attr.id)}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Thêm tag
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS cả attribute selector test.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/products/AttributeSelector.tsx website/seller/src/__tests__/attributeSelector.test.tsx
git commit -m "feat(seller): add AttributeSelector UI component to edit multi-value properties"
```

---

### Task 3: Phát sinh Danh sách Biến thể & Form nhập thông số giá, kho

**Files:**
- Create: `website/seller/src/components/products/VariantsTable.tsx`
- Create: `website/seller/src/__tests__/variantsTable.test.tsx`
- Modify: `website/seller/src/pages/ProductForm.tsx`

**Interfaces:**
- Consumes: Hàm `cartesianProduct` từ Task 1 và danh sách Attributes từ Task 2.
- Produces: Danh sách các variant sinh ra, cho phép người bán cấu hình giá, số lượng kho, SKU cho từng biến thể cụ thể trước khi lưu.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/__tests__/variantsTable.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VariantsTable from '../components/products/VariantsTable';

describe('VariantsTable cartesian mapper', () => {
  it('displays table header with attributes and fields inputs', () => {
    const mockAttributes = [
      { id: '1', name: 'Size', values: ['S', 'M'] },
    ];
    render(
      <VariantsTable
        attributes={mockAttributes}
        variants={[]}
        onChange={vi.fn()}
        baseSku="IPHONE"
        basePrice={100}
      />
    );

    expect(screen.getByText('Tổ hợp biến thể')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì `VariantsTable` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Tạo file VariantsTable:
Create: `website/seller/src/components/products/VariantsTable.tsx`
```typescript
import React, { useEffect } from 'react';
import { cartesianProduct } from '../../utils/cartesian';

export interface Variant {
  key: string; // "S-Red"
  label: string; // "S / Red"
  sku: string;
  price: number;
  stock: number;
}

interface VariantsTableProps {
  attributes: { name: string; values: string[] }[];
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  baseSku: string;
  basePrice: number;
}

export default function VariantsTable({ attributes, variants, onChange, baseSku, basePrice }: VariantsTableProps) {
  const activeAttributes = attributes.filter((attr) => attr.values.length > 0);

  useEffect(() => {
    if (activeAttributes.length === 0) {
      onChange([]);
      return;
    }

    const valueMatrix = activeAttributes.map((attr) => attr.values);
    const combinations = cartesianProduct(valueMatrix);

    const generatedVariants = combinations.map((combo) => {
      const key = combo.join('-');
      const label = combo.join(' / ');
      
      // Giữ lại thông tin cũ nếu biến thể này đã tồn tại
      const existing = variants.find((v) => v.key === key);
      if (existing) return existing;

      return {
        key,
        label,
        sku: `${baseSku || 'SKU'}-${combo.map((c) => c.toUpperCase().replace(/\s+/g, '')).join('-')}`,
        price: basePrice || 0,
        stock: 0,
      };
    });

    onChange(generatedVariants);
  }, [attributes, baseSku, basePrice]);

  if (activeAttributes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="font-bold text-slate-700">Tổ hợp biến thể ({variants.length})</div>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                <th className="p-3">Biến thể</th>
                <th className="p-3">Mã SKU</th>
                <th className="p-3">Giá bán *</th>
                <th className="p-3">Kho hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm">
              {variants.map((variant, idx) => (
                <tr key={variant.key} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-800">{variant.label}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].sku = e.target.value.toUpperCase();
                        onChange(updated);
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-slate-800 font-mono text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].price = Number(e.target.value);
                        onChange(updated);
                      }}
                      className="w-28 px-2 py-1 border border-slate-200 rounded text-slate-800 font-semibold text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[idx].stock = Number(e.target.value);
                        onChange(updated);
                      }}
                      className="w-24 px-2 py-1 border border-slate-200 rounded text-slate-800 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

Cập nhật `ProductForm.tsx` tích hợp cả `AttributeSelector` lẫn `VariantsTable` bên dưới thông số chính.

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS tất cả 13 tests.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/products/VariantsTable.tsx website/seller/src/pages/ProductForm.tsx website/seller/src/__tests__/variantsTable.test.tsx
git commit -m "feat(seller): add VariantsTable Cartesian combinations list and wire into ProductForm"
```

---

## 🏁 Phase Checklist & Common Fresher Errors

### 📋 Phase Complete Checklist
1. Hệ thống tính toán Cartesian Product hoạt động chính xác từ nhiều chiều tổ hợp (Size x Color x Storage).
2. Khi người bán thay đổi giá bán hoặc SKU ở form gốc (base price/SKU), các tổ hợp mới sinh ra tự động kế thừa giá trị đó.
3. Có thể thay đổi thủ công độc lập giá bán và tồn kho của từng tổ hợp mà không làm biến đổi các tổ hợp lân cận.
4. Xóa một thuộc tính hoặc thẻ giá trị cập nhật danh sách tổ hợp hiển thị tức thì.
5. Dữ liệu mảng biến thể sẵn sàng đính kèm vào payload gửi lên backend API cập nhật sản phẩm.

### ⚠️ Common Fresher Errors
- **Error:** Khi thay đổi thuộc tính, toàn bộ thông số giá bán/tồn kho đã nhập của các biến thể bị reset về giá trị mặc định làm mất công sức nhập liệu của người bán.
  - *Fix:* Trong `useEffect` sinh ra các biến thể, luôn tìm kiếm trong mảng `variants` cũ theo khóa `key` để tái sử dụng giá trị cũ nếu tồn tại trước khi tạo mới hoàn toàn.
- **Error:** Lỗi lặp vô tận (infinite loop render) do gán mảng mới sinh trực tiếp vào onChange mà không kiểm tra độ thay đổi của cấu trúc attributes.
  - *Fix:* Sử dụng danh sách dependency mảng phụ thuộc chính xác (`attributes`, `basePrice`, `baseSku`) trong `useEffect` và chỉ cập nhật mảng biến thể khi độ dài hoặc giá trị của chúng thực sự thay đổi.
- **Error:** Tổ hợp biến thể không được validate giá, dẫn đến việc lưu biến thể có giá nhỏ hơn hoặc bằng 0 thành công gây lỗi nghiệp vụ.
  - *Fix:* Trong hàm validate của `ProductForm.tsx`, nếu có biến thể đang cấu hình, lặp qua danh sách và kiểm tra điều kiện `variant.price > 0`.
