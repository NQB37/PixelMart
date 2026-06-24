# 🛒 PHASE 7: Cart & State Management (Multi-Shop Cart)

> **Prerequisite:** Phase 6 hoàn thành.

---

## 🎯 MVP Của Phase Này

- Guest user (chưa đăng nhập) thêm sản phẩm vào giỏ → lưu LocalStorage
- Logged-in user → giỏ hàng đồng bộ lên DB
- Khi đăng nhập → merge giỏ hàng guest vào DB (không mất sản phẩm)
- Giỏ hàng nhóm theo shop (giống Shopee: Shop A 2 items, Shop B 1 item)
- Badge số lượng ở header cập nhật real-time
- Xử lý edge cases: sản phẩm hết hàng, sản phẩm bị xóa

---

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo bảng giỏ hàng (`Cart`) và chi tiết giỏ hàng (`CartItem`) để đồng bộ giỏ hàng từ LocalStorage của Buyer lên cơ sở dữ liệu sau khi đăng nhập.

### 1. Thêm Vào `prisma/schema.prisma`:
```prisma
model Cart {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items CartItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("carts")
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int     @default(1)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId]) // 1 sản phẩm chỉ xuất hiện 1 lần trong giỏ
  @@index([cartId])
  @@map("cart_items")
}
```

Hãy nhớ cập nhật liên kết trong các model cũ:
- Trong `User`: `cart Cart?`
- Trong `Product`: `cartItems CartItem[]`

### 2. Chạy Migration:
```bash
npx prisma migrate dev --name add_cart
```

> [!NOTE]
> Giỏ hàng là dữ liệu mang tính biến động cao và mang tính tạm thời cho từng user, nên chúng ta không cần viết seed data cho Cart trong file `seed.ts`. User tự sinh ra giỏ hàng trong quá trình trải nghiệm hệ thống.

---

## 📋 Task Breakdown

### Task 7.1: Zustand Cart Store (3-4h)

```bash
cd web/client-web
npm install zustand
```

#### `web/client-web/stores/cartStore.ts`:
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  shopId: string;
  shopName: string;
  shopSlug: string;
  quantity: number;
  stock: number; // Để check max quantity
}

interface CartStore {
  items: CartItem[];
  isHydrated: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setHydrated: (state: boolean) => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByShop: () => Map<string, { shop: { id: string; name: string; slug: string }; items: CartItem[] }>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addItem: (newItem, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId
          );

          if (existingIndex > -1) {
            // Sản phẩm đã có → tăng số lượng (không vượt stock)
            const updated = [...state.items];
            const newQty = Math.min(
              updated[existingIndex].quantity + quantity,
              updated[existingIndex].stock
            );
            updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
            return { items: updated };
          }

          // Sản phẩm mới → thêm vào giỏ
          return {
            items: [...state.items, { ...newItem, quantity: Math.min(quantity, newItem.stock) }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setHydrated: (state) => set({ isHydrated: state }),

      // Computed getters
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemsByShop: () => {
        const shopMap = new Map();
        for (const item of get().items) {
          const existing = shopMap.get(item.shopId);
          if (existing) {
            existing.items.push(item);
          } else {
            shopMap.set(item.shopId, {
              shop: { id: item.shopId, name: item.shopName, slug: item.shopSlug },
              items: [item],
            });
          }
        }
        return shopMap;
      },
    }),
    {
      name: 'pixelmart-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
```

> **Tại sao Zustand thay vì Redux/Context?**
> - Zustand: ~1KB, không cần Provider wrapper, built-in persist middleware
> - Redux: ~10KB+, boilerplate nặng (actions, reducers, store setup)
> - Context: Re-renders toàn bộ tree khi state thay đổi

#### ⚠️ Lỗi fresher hay mắc:
- **Hydration mismatch:** Zustand persist đọc LocalStorage (chỉ có ở client). Khi Next.js render server-side, giỏ hàng = rỗng. Client-side render, giỏ hàng = 3 items. HTML mismatch → hydration error. Giải pháp: dùng `isHydrated` flag, chỉ render cart data SAU hydration.
- **Không limit quantity theo stock:** User bấm "+" liên tục → quantity = 999 nhưng kho chỉ có 5 → lỗi khi checkout.
- **Lưu giá trong cart store:** Giá ở cart store chỉ để HIỂN THỊ. Khi checkout, backend PHẢI lấy giá mới nhất từ DB. User có thể sửa LocalStorage để đổi giá.

---

### Task 7.2: Cart API — Backend (3-4h)

#### `src/modules/cart/cart.service.ts`:
```typescript
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/utils/ApiError';

class CartService {
  /**
   * Lấy giỏ hàng của user (nhóm theo shop)
   */
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true,
                price: true, stock: true, isActive: true, deletedAt: true,
                images: { where: { isPrimary: true }, take: 1 },
                shop: { select: { id: true, name: true, slug: true, status: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // Tạo cart rỗng nếu chưa có
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    // Filter & flag invalid items (SP hết hàng, bị xóa, shop inactive)
    const validItems = [];
    const invalidItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      if (!product.isActive || product.deletedAt || product.shop.status !== 'ACTIVE') {
        invalidItems.push({ ...item, reason: 'Sản phẩm không còn bán' });
      } else if (product.stock < item.quantity) {
        validItems.push({
          ...item,
          warning: product.stock === 0
            ? 'Hết hàng'
            : `Chỉ còn ${product.stock} sản phẩm`,
          adjustedQuantity: product.stock,
        });
      } else {
        validItems.push(item);
      }
    }

    return { cart, validItems, invalidItems };
  }

  /**
   * Thêm sản phẩm vào giỏ (hoặc tăng số lượng)
   */
  async addItem(userId: string, productId: string, quantity: number = 1) {
    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: { select: { status: true } } },
    });

    if (!product || !product.isActive || product.deletedAt) {
      throw ApiError.notFound('Sản phẩm không tồn tại');
    }
    if (product.shop.status !== 'ACTIVE') {
      throw ApiError.badRequest('Shop đã ngừng hoạt động');
    }
    if (product.stock < quantity) {
      throw ApiError.badRequest(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    // Check sau khi update không vượt stock
    if (cartItem.quantity > product.stock) {
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: product.stock },
      });
    }

    return cartItem;
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound('Giỏ hàng không tồn tại');

    if (quantity < 1) {
      // Quantity = 0 → xóa khỏi giỏ
      return this.removeItem(userId, productId);
    }

    // Validate stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product && quantity > product.stock) {
      throw ApiError.badRequest(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    return prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  }

  /**
   * MERGE giỏ hàng guest (từ LocalStorage) vào DB
   * Gọi ngay sau khi login thành công
   */
  async mergeCart(userId: string, guestItems: { productId: string; quantity: number }[]) {
    if (!guestItems.length) return;

    for (const guestItem of guestItems) {
      try {
        await this.addItem(userId, guestItem.productId, guestItem.quantity);
      } catch {
        // Skip invalid items (hết hàng, SP bị xóa, etc.)
        continue;
      }
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
}

export const cartService = new CartService();
```

#### Cart Routes:
```typescript
// POST   /api/v1/cart/items          — Thêm SP vào giỏ
// GET    /api/v1/cart                — Lấy giỏ hàng
// PATCH  /api/v1/cart/items/:productId — Cập nhật số lượng
// DELETE /api/v1/cart/items/:productId — Xóa SP khỏi giỏ
// POST   /api/v1/cart/merge          — Merge guest cart sau login
// DELETE /api/v1/cart                — Xóa toàn bộ giỏ hàng
```

#### ⚠️ Lỗi fresher hay mắc:
- **Trust giá từ client khi merge cart:** Guest cart trong LocalStorage chứa `{ productId, price: 100 }`. User sửa thành `price: 1`. Backend PHẢI ignore price từ client, chỉ nhận `productId` + `quantity`.
- **Không handle sản phẩm đã bị xóa:** Sau khi thêm vào giỏ, seller xóa sản phẩm → checkout crash. Cart GET endpoint phải filter + flag invalid items.
- **Race condition khi update quantity:** 2 tabs cùng bấm "+" → quantity tăng 2 lần hoặc bị ghi đè. Dùng `{ increment: 1 }` thay vì `{ quantity: newValue }`.

---

### Task 7.3: Cart UI Components (3-4h)

Xây dựng các components:
- `CartSheet.tsx` — Slide-out panel (bấm icon giỏ hàng ở header)
- `CartItem.tsx` — Mỗi sản phẩm trong giỏ (ảnh, tên, giá, +/- quantity, xóa)
- `CartSummary.tsx` — Tổng tiền, nút "Đặt hàng"
- `CartIcon.tsx` — Icon giỏ hàng ở header với badge số lượng

**Key UX:**
- Nhóm items theo shop (ShopA: 2 items, ShopB: 1 item)
- Hiện warning cho SP hết hàng (disable +, hiện "Hết hàng")
- Hiện "Sản phẩm không còn bán" cho SP bị xóa (strike-through + nút xóa)
- Optimistic UI: bấm "+" → số lượng tăng NGAY → gọi API → rollback nếu lỗi

### Task 7.4: Cart Merge Logic sau Login (2-3h)

Trong `features/auth/hooks/useAuth.ts`, sau khi login thành công:

```typescript
const login = async (email: string, password: string) => {
  const result = await authService.login({ email, password });
  
  // Merge guest cart
  const guestItems = useCartStore.getState().items;
  if (guestItems.length > 0) {
    await cartService.mergeCart(
      guestItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    );
    // Xóa guest cart ở LocalStorage
    useCartStore.getState().clearCart();
  }
  
  // Fetch server cart
  const serverCart = await cartService.getCart();
  useCartStore.getState().setItems(serverCart.validItems);
  
  return result;
};
```

---

## 🏁 Checklist Cuối Phase 7

- [ ] Guest user: thêm/sửa/xóa items trong giỏ (LocalStorage)
- [ ] Logged-in user: giỏ hàng đồng bộ với DB
- [ ] Login → merge guest cart vào DB, không mất item
- [ ] Giỏ hàng nhóm theo shop
- [ ] Badge header cập nhật real-time
- [ ] Handle: SP hết hàng, SP bị xóa, shop inactive
- [ ] Không bị hydration error (Next.js SSR + LocalStorage)
- [ ] Quantity không vượt stock
- [ ] Commit: "feat: multi-shop cart with guest merge and real-time sync"
