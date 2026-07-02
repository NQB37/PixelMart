# 📋 PHASE 8: Order Processing & Checkout

> **Prerequisite:** Phase 7 hoàn thành.

---

## 🎯 MVP Của Phase Này

- API Checkout: Nhận địa chỉ, phương thức thanh toán (COD/Bank Transfer) và tạo đơn hàng
- 1 checkout tạo N orders (1 per shop) — giống Shopee
- Stock validation + stock deduction trong transaction
- Order status flow: PENDING -> CONFIRMED -> SHIPPING -> DELIVERED / CANCELLED
- Seller quản lý đơn hàng (xem, cập nhật trạng thái qua API)
- Buyer xem lịch sử đơn hàng + chi tiết đơn qua API
- Idempotency Key chống tạo đơn trùng (bấm nút 2 lần)

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo bảng quản lý địa chỉ giao hàng (`Address`), bảng đơn hàng (`Order`) và chi tiết đơn hàng (`OrderItem`).

### 1. Thêm Vào `prisma/schema.prisma`:

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  COD
  BANK_TRANSFER
  VNPAY
  STRIPE
}

model Address {
  id            String           @id @default(uuid())
  ownerId       String
  ownerType     AddressOwnerType // USER | SHOP (địa chỉ polymorphic)
  recipientName String
  phone         String
  street        String           // Số nhà, tên đường
  wardID        String
  provinceId    String
  isDefault     Boolean          @default(false)
  label         AddressLabel     // HOME | OFFICE | PICKUP | BUSINESS | OTHER
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  user User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, ownerType])
  @@map("addresses")
}

model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  shopId        String
  shop          Shop          @relation(fields: [shopId], references: [id])
  status        OrderStatus   @default(PENDING)
  subtotal      Decimal       @db.Decimal(12, 2) // Tổng giá SP
  shippingFee   Decimal       @default(0) @db.Decimal(12, 2)
  discount      Decimal       @default(0) @db.Decimal(12, 2)
  totalAmount   Decimal       @db.Decimal(12, 2)
  addressId     String
  address       Address       @relation(fields: [addressId], references: [id])
  paymentMethod PaymentMethod @default(COD)
  paymentStatus PaymentStatus @default(PENDING)
  couponId      String?       // nullable cho platform/shop coupon (sẽ map ở Phase 10)
  note          String?

  items OrderItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([shopId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String
  product      Product @relation(fields: [productId], references: [id])
  // === SNAPSHOT DATA (KHÔNG THAY ĐỔI) ===
  productName  String
  productPrice Decimal @db.Decimal(12, 2)
  productImage String?
  // =====================================
  quantity     Int
  subtotal     Decimal @db.Decimal(12, 2)

  @@index([orderId])
  @@map("order_items")
}
```

Hãy nhớ cập nhật liên kết trong các model cũ:

- Trong `User`: `addresses Address[]`, `orders Order[]`
- Trong `Shop`: `orders Order[]`
- Trong `Product`: `orderItems OrderItem[]`

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name add_orders
```

### 3. Viết Seed Data Cho `prisma/seed.ts`:

Cập nhật file `prisma/seed.ts` để tạo một địa chỉ mặc định cho Buyer:

```typescript
import { PrismaClient, ROLE, ShopStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Phase 8...");
  const hashedPassword = await bcrypt.hash("Password@123", 12);

  // 1. Seed Buyer
  const buyer = await prisma.user.upsert({
    where: { email: "buyer1@pixelmart.com" },
    update: {},
    create: {
      email: "buyer1@pixelmart.com",
      password: hashedPassword,
      profile: { create: { fullName: "Trần Thị Buyer" } },
      roles: { create: { role: { connect: { name: ROLE.CUSTOMER } } } },
    },
  });

  // 2. Seed Address mặc định cho Buyer
  await prisma.address.upsert({
    where: { id: "default-addr-buyer1" },
    update: {},
    create: {
      id: "default-addr-buyer1",
      ownerId: buyer.id,
      ownerType: "USER",
      recipientName: "Trần Thị Buyer",
      phone: "0901234567",
      provinceId: "Hồ Chí Minh",
      wardID: "Phường Bến Nghé",
      street: "123 Nguyễn Huệ",
      label: "HOME",
      isDefault: true,
    },
  });

  console.log("✅ Seeding Phase 8 complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Chạy seed:

```bash
npx prisma db seed
```

---

## 📋 Task Breakdown

### Task 8.1: Address Management API (2-3h)

```typescript
// API Endpoints:
// POST   /api/v1/addresses       — Tạo địa chỉ mới
// GET    /api/v1/addresses       — Lấy danh sách địa chỉ của user
// PUT    /api/v1/addresses/:id   — Cập nhật địa chỉ
// DELETE /api/v1/addresses/:id   — Xóa địa chỉ
// PATCH  /api/v1/addresses/:id/default — Set làm địa chỉ mặc định
```

**Lưu ý:** Khi set 1 address là `isDefault: true`, phải set tất cả address khác của user thành `isDefault: false` trong cùng transaction.

---

### Task 8.2: Order Service — Core Logic (5-7h)

#### `src/modules/order/order.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { Prisma } from "@prisma/client";

interface CheckoutInput {
  addressId: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
  couponCode?: string;
  note?: string;
  idempotencyKey: string; // Chống tạo đơn trùng
}

class OrderService {
  /**
   * CHECKOUT: Tạo đơn hàng từ giỏ hàng
   *
   * Flow:
   * 1. Validate idempotency key
   * 2. Lấy giỏ hàng + validate items
   * 3. Nhóm items theo shop
   * 4. Validate coupon (nếu có)
   * 5. Tạo N orders (1 per shop) trong transaction:
   *    a. Tạo order + order items (snapshot giá)
   *    b. Trừ stock (SELECT FOR UPDATE — pessimistic lock)
   *    c. Tăng soldCount
   *    d. Xóa items đã đặt khỏi giỏ
   */
  async checkout(userId: string, input: CheckoutInput) {
    // 1. Idempotency check
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        // Lưu idempotency key vào note hoặc metadata
        note: { contains: `[IDKEY:${input.idempotencyKey}]` },
      },
    });
    if (existingOrder) {
      // Đã tạo rồi → trả về order cũ thay vì tạo mới
      return this.getOrdersByCheckout(userId, input.idempotencyKey);
    }

    // 2. Validate address
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, ownerId: userId, ownerType: "USER" },
    });
    if (!address) throw ApiError.notFound("Địa chỉ giao hàng không hợp lệ");

    // 3. Lấy giỏ hàng
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: { select: { id: true, shopName: true, status: true } },
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Giỏ hàng trống");
    }

    // 4. Validate & nhóm theo shop
    const shopGroups = new Map<string, typeof cart.items>();

    for (const item of cart.items) {
      const product = item.product;

      // Validate product
      if (!product.isActive || product.deletedAt) {
        throw ApiError.badRequest(`Sản phẩm "${product.name}" không còn bán`);
      }
      if (product.shop.status !== "ACTIVE") {
        throw ApiError.badRequest(
          `Shop "${product.shop.shopName}" đã ngừng hoạt động`,
        );
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
        );
      }

      const shopId = product.shop.id;
      if (!shopGroups.has(shopId)) {
        shopGroups.set(shopId, []);
      }
      shopGroups.get(shopId)!.push(item);
    }

    // 5. Tạo orders trong transaction
    const orders = await prisma.$transaction(
      async (tx) => {
        const createdOrders = [];

        for (const [shopId, items] of shopGroups) {
          // Tính tổng tiền
          let subtotal = new Prisma.Decimal(0);
          const orderItems = [];

          for (const item of items) {
            const product = item.product;
            const itemSubtotal = new Prisma.Decimal(
              product.price.toString(),
            ).mul(item.quantity);
            subtotal = subtotal.add(itemSubtotal);

            // === STOCK DEDUCTION với Pessimistic Lock ===
            // Dùng raw SQL SELECT FOR UPDATE để lock row
            const [updated] = await tx.$queryRaw<any[]>`
            UPDATE products 
            SET stock = stock - ${item.quantity},
                "soldCount" = "soldCount" + ${item.quantity},
                "updatedAt" = NOW()
            WHERE id = ${product.id} 
              AND stock >= ${item.quantity}
            RETURNING id, stock
          `;

            if (!updated) {
              throw ApiError.badRequest(
                `Sản phẩm "${product.name}" không đủ hàng trong kho`,
              );
            }

            orderItems.push({
              productId: product.id,
              productName: product.name, // SNAPSHOT
              productPrice: product.price, // SNAPSHOT
              productImage: product.images?.[0]?.url || null, // SNAPSHOT
              quantity: item.quantity,
              subtotal: itemSubtotal,
            });
          }

          const shippingFee = new Prisma.Decimal(0); // MVP: free shipping
          const discount = new Prisma.Decimal(0); // Coupon xử lý ở Phase 10
          const totalAmount = subtotal.add(shippingFee).sub(discount);

          // Generate order number: ORD-20260616-XXXX
          const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

          const order = await tx.order.create({
            data: {
              orderNumber,
              userId,
              shopId,
              status: "PENDING",
              subtotal,
              shippingFee,
              discount,
              totalAmount,
              addressId: input.addressId,
              paymentMethod: input.paymentMethod,
              paymentStatus:
                input.paymentMethod === "COD" ? "PENDING" : "PENDING",
              note: input.note
                ? `${input.note} [IDKEY:${input.idempotencyKey}]`
                : `[IDKEY:${input.idempotencyKey}]`,
              items: {
                create: orderItems,
              },
            },
            include: {
              items: true,
              shop: { select: { shopName: true } },
            },
          });

          createdOrders.push(order);
        }

        // Xóa items đã đặt khỏi giỏ hàng
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return createdOrders;
      },
      {
        timeout: 10000, // 10s timeout
        isolationLevel: "Serializable", // Highest isolation level
      },
    );

    return orders;
  }

  // === BUYER ===

  async getMyOrders(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          shop: { select: { shopName: true, logoUrl: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrderDetail(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        shop: { select: { shopName: true, logoUrl: true } },
        address: true,
        coupon: true,
      },
    });
    if (!order) throw ApiError.notFound("Đơn hàng không tồn tại");
    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw ApiError.notFound("Đơn hàng không tồn tại");
    if (order.status !== "PENDING") {
      throw ApiError.badRequest("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
    }

    // Hoàn lại stock
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    });
  }

  // === SELLER ===

  async getShopOrders(shopId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { shopId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { email: true, profile: { select: { fullName: true } } } },
          address: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateOrderStatus(orderId: string, shopId: string, newStatus: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, shopId },
    });
    if (!order) throw ApiError.notFound("Đơn hàng không tồn tại");

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED"],
      DELIVERED: [], // Final state
      CANCELLED: [], // Final state
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw ApiError.badRequest(
        `Không thể chuyển từ "${order.status}" sang "${newStatus}"`,
      );
    }

    // Nếu seller cancel → hoàn stock
    if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });
      });
      return;
    }

    // Nếu delivered + COD → payment = PAID
    const data: any = { status: newStatus };
    if (newStatus === "DELIVERED" && order.paymentMethod === "COD") {
      data.paymentStatus = "PAID";
    }

    return prisma.order.update({ where: { id: orderId }, data });
  }
}

export const orderService = new OrderService();
```

#### ⚠️ Lỗi fresher hay mắc (CRITICAL):

1. **Race condition khi trừ kho:**

   ```typescript
   // ❌ SAI — 2 users cùng mua SP cuối cùng (stock = 1)
   const product = await prisma.product.findUnique({ where: { id } });
   if (product.stock >= quantity) {
     // Cả 2 đều thấy stock = 1
     await prisma.product.update({
       where: { id },
       data: { stock: product.stock - quantity }, // Cả 2 đều set stock = 0
     });
   }
   // Kết quả: bán 2 items nhưng kho chỉ có 1 → OVER-SELLING!

   // ✅ ĐÚNG — Atomic update với condition
   const [result] = await tx.$queryRaw`
     UPDATE products SET stock = stock - ${qty}
     WHERE id = ${id} AND stock >= ${qty}
     RETURNING id
   `;
   if (!result) throw ApiError.badRequest("Hết hàng");
   ```

2. **Không có idempotency key:** User bấm "Đặt hàng" → mạng chậm → bấm lại → tạo 2 đơn hàng giống nhau. Idempotency key từ client đảm bảo cùng 1 request chỉ xử lý 1 lần.

3. **Invalid status transition:** Đơn hàng DELIVERED rồi bấm CANCELLED? CANCELLED rồi bấm CONFIRMED? Phải có state machine validate transitions.

4. **Trừ kho trước khi thanh toán (cho online payment):** Với COD thì OK vì shop confirm thủ công. Nhưng với VNPAY, phải "giữ hàng" (reserve) rồi chỉ trừ khi webhook confirm thanh toán.

---

### Task 8.3: Order Routes (1-2h)

```typescript
// === BUYER ===
// POST   /api/v1/orders                    — Checkout (tạo đơn)
// GET    /api/v1/orders                    — Lịch sử đơn hàng
// GET    /api/v1/orders/:id                — Chi tiết đơn hàng
// POST   /api/v1/orders/:id/cancel         — Hủy đơn
//
// === SELLER ===
// GET    /api/v1/seller/orders             — Đơn hàng của shop
// PATCH  /api/v1/seller/orders/:id/status  — Cập nhật trạng thái
```

---

## 🏁 Checklist Cuối Phase 8

- [ ] Checkout tạo N orders (1 per shop) trong 1 transaction
- [ ] Stock deduction atomic (không over-selling)
- [ ] Idempotency key chống tạo đơn trùng
- [ ] Order status transitions validated (state machine)
- [ ] Cancel order → hoàn lại stock
- [ ] Buyer: xem lịch sử đơn, chi tiết đơn, hủy đơn PENDING
- [ ] Seller: xem đơn hàng shop, cập nhật trạng thái
- [ ] COD → DELIVERED = auto set PAID
- [ ] Snapshot giá/tên/ảnh trong OrderItem
- [ ] Commit: "feat: order processing with stock management and multi-shop checkout"
