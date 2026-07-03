# Phase 07: Cart State Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai Zustand Cart Store quản lý giỏ hàng (thêm, sửa, xóa sản phẩm), lưu trữ cookie/local storage cho khách vãng lai (Guest) và tự động đồng bộ hóa/Merge giỏ hàng lên server ngay khi đăng nhập.

**Architecture:** Sử dụng Zustand Persist Middleware tự động đồng bộ trạng thái giỏ hàng dưới Client xuống `localStorage`. Khi user đăng nhập thành công, một service `mergeCart` sẽ gửi toàn bộ sản phẩm từ local storage lên API `/cart/merge`, gộp chung với giỏ hàng hiện tại trên DB, sau đó cập nhật lại state client.

**Tech Stack:** Zustand, Zustand Persist Middleware, Axios (API Client), Jest.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 15 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 7.1: Zustand Cart Store with local storage Persistence

**Files:**
- Create: `website/client/stores/cartStore.ts`
- Test: `website/client/__tests__/cartStore.test.ts`

**Interfaces:**
- Consumes: Product model structure
- Produces: Hook `useCartStore` quản lý mảng `items`, tổng số lượng, tổng tiền và đồng bộ localStorage.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm thử thêm, xóa, cập nhật số lượng giỏ hàng:
Create: `website/client/__tests__/cartStore.test.ts`
```typescript
import { useCartStore } from '../stores/cartStore';

describe('Cart Store (Zustand + Persist)', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds a new item to cart', () => {
    const mockItem = {
      productId: 'p1',
      name: 'Smart Phone',
      price: 10000,
      quantity: 1,
      imageUrl: 'phone.jpg',
      shopId: 's1',
    };

    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe('p1');
    expect(state.items[0].quantity).toBe(1);
  });

  it('increments quantity if item already exists in cart', () => {
    const mockItem = {
      productId: 'p1',
      name: 'Smart Phone',
      price: 10000,
      quantity: 1,
      imageUrl: 'phone.jpg',
      shopId: 's1',
    };

    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem); // Add again

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('updates item quantity directly', () => {
    const mockItem = {
      productId: 'p1',
      name: 'Smart Phone',
      price: 10000,
      quantity: 1,
      imageUrl: 'phone.jpg',
      shopId: 's1',
    };
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('p1', 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item from cart', () => {
    const mockItem = {
      productId: 'p1',
      name: 'Smart Phone',
      price: 10000,
      quantity: 1,
      imageUrl: 'phone.jpg',
      shopId: 's1',
    };
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem('p1');

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do store `cartStore.ts` chưa được định nghĩa.

- [ ] **Step 3: Write minimal implementation**
Tạo Zustand Cart Store có Persist:
Create: `website/client/stores/cartStore.ts`
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  shopId: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }
          return { items: [...state.items, newItem] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    {
      name: 'pixelmart-cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : sessionStorage)),
    }
  )
);
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS cartStore.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add stores/cartStore.ts __tests__/cartStore.test.ts
git commit -m "feat(client): develop Zustand cartStore with localStorage persistence support"
```

---

### Task 7.2: Cart Merging Logic upon Login

**Files:**
- Create: `website/client/services/cart.service.ts`
- Test: `website/client/__tests__/cart-sync.test.ts`

**Interfaces:**
- Consumes: API endpoints `/cart/merge`, Zustand `cartStore` and `authStore`
- Produces: Hàm helper `mergeCartAfterLogin` gộp local cart lên db và đồng bộ hóa state sau khi người dùng đăng nhập.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm tra xem service có gọi API gộp giỏ hàng và cập nhật lại state của store hay không:
Create: `website/client/__tests__/cart-sync.test.ts`
```typescript
import { mergeCartAfterLogin } from '../services/cart.service';
import { useCartStore } from '../stores/cartStore';

// Mock the API client
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [
          { productId: 'p1', name: 'Smart Phone', price: 10000, quantity: 3, imageUrl: 'phone.jpg', shopId: 's1' }
        ]
      }
    }),
  },
}));

describe('Cart Synchronization Service', () => {
  it('should merge local cart items with server cart and update store', async () => {
    useCartStore.setState({
      items: [
        { productId: 'p1', name: 'Smart Phone', price: 10000, quantity: 2, imageUrl: 'phone.jpg', shopId: 's1' }
      ]
    });

    await mergeCartAfterLogin();
    
    // Check if the store is updated with merged database response
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3); // Updated from server response
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo file `cart.service.ts` chứa hàm merge.

- [ ] **Step 3: Write minimal implementation**
Tạo Cart Service:
Create: `website/client/services/cart.service.ts`
```typescript
import { api } from '@/lib/api';
import { useCartStore } from '../stores/cartStore';

export async function mergeCartAfterLogin() {
  const localItems = useCartStore.getState().items;
  if (localItems.length === 0) return;

  try {
    const response = await api.post('/cart/merge', {
      items: localItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    if (response.data && response.data.success) {
      // Server returns the complete merged cart
      useCartStore.getState().setItems(response.data.data);
    }
  } catch (error) {
    console.error('Failed to merge cart on login:', error);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS cart-sync.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add services/cart.service.ts __tests__/cart-sync.test.ts
git commit -m "feat(client): implement backend merge cart logic upon user login"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Hydration Mismatch**: Next.js App Router render HTML tĩnh ở máy chủ (mặc định giỏ hàng trống), sau đó ở client hydrate dữ liệu từ `localStorage` gây lỗi lệch DOM. 
   - *Cách khắc phục*: Luôn sử dụng flag `mounted` trước khi render component giỏ hàng phụ thuộc vào state persisted.
2. **Không nhóm Cart Item theo Shop**: PixelMart là hệ thống Multi-vendor, mỗi shop có thể xử lý vận đơn riêng. Khi hiển thị giỏ hàng, cần nhóm các sản phẩm theo `shopId` thay vì render một list phẳng không rõ của shop nào.

### Checklist Cuối Phase
- [ ] Thêm sản phẩm ngoài màn hình tự động lưu thông tin vào Local Storage dưới key `pixelmart-cart`.
- [ ] Đăng nhập tài khoản Buyer gọi API `/cart/merge` gộp sản phẩm thành công.
- [ ] Các thao tác tăng giảm số lượng cập nhật tổng tiền thanh toán ngay lập tức.
- [ ] 100% test cases cho cart store và sync cart đều PASS.
