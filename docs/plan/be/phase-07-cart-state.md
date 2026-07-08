# 🛒 PHASE 7: Cart & State Management (Multi-Shop Cart)

> **Prerequisite:** Phase 6 hoàn thành.

---

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh path/lệnh cho khớp codebase hiện tại (server mới có `auth`/`shop`/`upload`).

## 🎯 MVP Của Phase Này

- Lấy giỏ hàng của user hiện tại, nhóm theo shop
- API CRUD cho CartItem (thêm, cập nhật số lượng, xóa khỏi giỏ)
- API merge giỏ hàng guest vào DB sau khi đăng nhập (không tin tưởng giá từ client, merge quantity nếu trùng)
- Xử lý edge cases: sản phẩm hết hàng, sản phẩm bị xóa, shop bị suspend/inactive

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
pnpm prisma migrate dev --name add_cart
```

> [!NOTE]
> Giỏ hàng là dữ liệu mang tính biến động cao và mang tính tạm thời cho từng user, nên chúng ta không cần viết seed data cho Cart trong file `seed.ts`. User tự sinh ra giỏ hàng trong quá trình trải nghiệm hệ thống.

---

## 📋 Task Breakdown

### Task 7.1: Cart API — Backend (3-4h)

#### `src/modules/cart/cart.service.ts`:

```typescript
import { prisma } from "@/libs/prisma";
import { ApiError } from "@/utils/ApiError";

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
                id: true,
                name: true,
                slug: true,
                price: true,
                stock: true,
                isActive: true,
                deletedAt: true,
                images: { where: { isPrimary: true }, take: 1 },
                shop: {
                  select: { id: true, name: true, slug: true, status: true },
                },
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
      if (
        !product.isActive ||
        product.deletedAt ||
        product.shop.status !== "ACTIVE"
      ) {
        invalidItems.push({ ...item, reason: "Sản phẩm không còn bán" });
      } else if (product.stock < item.quantity) {
        validItems.push({
          ...item,
          warning:
            product.stock === 0
              ? "Hết hàng"
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
      throw ApiError.notFound("Sản phẩm không tồn tại");
    }
    if (product.shop.status !== "ACTIVE") {
      throw ApiError.badRequest("Shop đã ngừng hoạt động");
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

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw ApiError.notFound("Giỏ hàng không tồn tại");

    if (quantity < 1) {
      // Quantity = 0 → xóa khỏi giỏ
      return this.removeItem(userId, productId);
    }

    // Validate stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
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
  async mergeCart(
    userId: string,
    guestItems: { productId: string; quantity: number }[],
  ) {
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

## 🏁 Checklist Cuối Phase 7

- [ ] `GET /api/v1/cart` — API lấy giỏ hàng của user hiện tại, nhóm theo shop
- [ ] `POST /api/v1/cart/items` — API thêm sản phẩm vào giỏ, kiểm tra tồn kho (stock)
- [ ] `PUT /api/v1/cart/items/:itemId` — API cập nhật số lượng sản phẩm trong giỏ
- [ ] `DELETE /api/v1/cart/items/:itemId` — API xóa sản phẩm khỏi giỏ
- [ ] `POST /api/v1/cart/merge` — API merge guest cart vào DB sau khi đăng nhập (không tin tưởng giá từ client, merge quantity nếu trùng)
- [ ] `DELETE /api/v1/cart` — API clear giỏ hàng sau khi checkout thành công
- [ ] Xử lý cờ invalid hoặc ẩn sản phẩm hết hàng, bị xóa, hoặc shop inactive khi trả về giỏ hàng
- [ ] Commit: "feat: backend cart APIs with guest merge logic and validation"
