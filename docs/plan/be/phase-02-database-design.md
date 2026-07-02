# 🗄️ PHASE 2: Database Design & ORM Setup (Multi-Vendor)

> **Độ khó:** ⭐⭐ Intermediate
> **Thời lượng ước tính:** 12-18 giờ
> **Prerequisite:** Phase 1 hoàn thành, PostgreSQL chạy local

---

## 🎯 MVP Của Phase Này

- ERD hoàn chỉnh cho Multi-Vendor Marketplace (để định hình context toàn hệ thống).
- Khởi tạo Prisma, cài đặt Prisma Client singleton.
- Kết nối thành công tới database PostgreSQL qua CLI và test connection thành công bằng query đơn giản.
- Thiết kế target Prisma schema hoàn chỉnh (nhưng chưa migrate hết) để làm tài liệu đối chiếu cho các phase sau.

---

## 📋 Task Breakdown

### Task 2.1: Thiết Kế ERD — Multi-Vendor Marketplace (4-5h)

> **Công cụ:** https://dbdiagram.io

#### So sánh ERD Single-Vendor vs Multi-Vendor:

```
SINGLE-VENDOR (đơn giản):         MULTI-VENDOR (PixelMart):
User → Order                       User → Shop (1 user = 1 shop)
Product → Category                 Shop → Product (shop sở hữu SP)
Order → OrderItem → Product        User → Order → OrderItem
                                   Shop → Coupon (shop tạo mã GG)
                                   Admin quản lý tất cả
```

#### Danh sách bảng cần thiết (Phase MVP):

```
CORE AUTH & RBAC (đã migrate):
1. User              — Tài khoản (email/password hoặc OAuth). KHÔNG chứa role.
2. Profile           — Thông tin cá nhân (fullName, avatarUrl, phone...) — tách 1-1 khỏi User
3. RefreshToken      — JWT refresh tokens
4. Role              — Vai trò: CUSTOMER / SELLER / ADMIN / DELIVERY_PERSON
5. UserRoles         — Bảng nối User ↔ Role (nhiều-nhiều)
6. Permission        — Quyền hạn chi tiết
7. RolePermissions   — Bảng nối Role ↔ Permission

ACTORS & ADDRESS (đã migrate):
8. Shop              — Cửa hàng (1 seller = 1 shop); approvalStatus + status tách riêng
9. DeliveryPerson    — Người giao hàng (role DELIVERY_PERSON)
10. Address          — Địa chỉ POLYMORPHIC (ownerType USER | SHOP), 1 chủ nhiều địa chỉ

COMMERCE & FEATURES (PLANNED — migrate dần ở phase 5–10):
11. Category         — Danh mục sản phẩm (admin quản lý)
12. Product          — Sản phẩm (thuộc về 1 shop)
13. ProductImage     — Ảnh sản phẩm (tách bảng riêng)
14. Cart / CartItem  — Giỏ hàng (thuộc về 1 user)
15. Order / OrderItem — Đơn hàng (OrderItem snapshot giá)
16. Review           — Đánh giá sản phẩm
17. Wishlist         — Danh sách yêu thích
18. Coupon           — Mã giảm giá (shop hoặc platform)
```

#### ERD Diagram (Text-based):

```
┌──────────────┐  1-1    ┌──────────────┐
│     User     │────────→│   Profile    │  fullName/avatar/phone nằm ở đây
├──────────────┤         ├──────────────┤
│ id ◄──uuid   │         │ id           │
│ email ◄──UQ  │         │ userId ◄──UQ │
│ password?    │←nullable│ fullName     │
│ provider(EN) │←OAuth   │ avatarUrl    │
│ isActive     │         │ phoneNumber  │
│ createdAt    │         │ dateOfBirth  │
│ updatedAt    │         │ gender (ENUM)│
└──────┬───────┘         └──────────────┘
       │  RBAC (nhiều-nhiều, KHÔNG có cột role trên User)
       │   User ─< UserRoles >─ Role ─< RolePermissions >─ Permission
       │           Role.name ∈ {CUSTOMER, SELLER, ADMIN, DELIVERY_PERSON}
       │
       ├──────────────→ Shop (1 User = 0..1 Shop)
       │                ┌──────────────┐
       │                │    Shop      │
       │                ├──────────────┤
       │                │ id           │
       │                │ ownerId ◄─UQ │
       │                │ shopName     │
       │                │ logoUrl      │
       │                │ rating(Float)│ ← Computed average
       │                │ approvalStat │ ← PENDING/APPROVED/REJECTED
       │                │ rejectedRsn  │
       │                │ status (ENUM)│ ← ACTIVE/SUSPENDED/INACTIVE
       │                │ deletedAt    │ ← soft delete
       │                └──────────────┘
       │
       ├──────────────→ DeliveryPerson (1 User = 0..1)
       │                │ vehicleType/Plate/Color, approvalStatus,
       │                │ activityStatus(ONLINE/OFFLINE/BUSY), status
       │
       │ has many
       ▼
┌──────────────┐         ┌──────────────┐
│   Address    │         │   Product    │  (PLANNED)
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ ownerId (FK) │←USER    │ name         │
│ ownerType(EN)│  hoặc   │ slug ◄──UQ   │
│ recipientName│  SHOP   │ description  │
│ phone        │         │ price ◄DECIMAL│
│ street       │         │ comparePrice │
│ wardID       │         │ sku ◄──UQ    │
│ provinceId   │←no dist │ stock        │
│ label (ENUM) │         │ shopId (FK)  │ ← Thuộc về Shop!
│ isDefault    │         │ categoryId   │
└──────────────┘         │ isActive     │
                         │ isFeatured   │
┌──────────────┐         │ soldCount    │
│  Category    │         │ createdAt    │
├──────────────┤         │ updatedAt    │
│ id           │         │ deletedAt    │
│ name         │         └──────┬───────┘
│ slug ◄──UQ   │                │ has many
│ description  │                ▼
│ image        │         ┌──────────────┐
│ parentId(FK) │←self    │ ProductImage │
│ isActive     │         ├──────────────┤
│ sortOrder    │         │ id           │
│ createdAt    │         │ productId(FK)│
│ updatedAt    │         │ url          │
└──────────────┘         │ alt          │
                         │ sortOrder    │
                         │ isPrimary    │
                         └──────────────┘

┌──────────────┐         ┌──────────────┐
│    Order     │         │  OrderItem   │
├──────────────┤         ├──────────────┤
│ id           │────────→│ id           │
│ orderNumber  │ has many│ orderId (FK) │
│ userId (FK)  │         │ productId(FK)│
│ shopId (FK)  │◄── !!!  │ productName  │ ← SNAPSHOT!
│ status(ENUM) │         │ productPrice │ ← SNAPSHOT!
│ subtotal     │         │ productImage │ ← SNAPSHOT!
│ shippingFee  │         │ quantity     │
│ discount     │         │ subtotal     │
│ totalAmount  │         └──────────────┘
│ addressId(FK)│
│ paymentMethod│
│ paymentStatus│
│ couponId(FK) │ ← optional
│ note         │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐         ┌──────────────┐
│   Review     │         │   Wishlist   │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ userId (FK)  │         │ userId (FK)  │
│ productId(FK)│         │ productId(FK)│
│ orderId (FK) │←phải mua│ createdAt    │
│ rating (1-5) │  mới    │              │
│ comment      │  được   │ @@unique     │
│ images       │  review │ ([userId,    │
│ createdAt    │         │  productId]) │
│ updatedAt    │         └──────────────┘
└──────────────┘

┌──────────────┐         ┌──────────────┐
│   Coupon     │         │    Cart      │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ code ◄──UQ   │         │ userId (FK)  │
│ shopId(FK)   │←nullable│ createdAt    │
│ type (ENUM)  │ null=   │ updatedAt    │
│ value        │ platform│              │
│ minOrderVal  │         └──────┬───────┘
│ maxDiscount  │                │ has many
│ usageLimit   │                ▼
│ usedCount    │         ┌──────────────┐
│ startDate    │         │   CartItem   │
│ endDate      │         ├──────────────┤
│ isActive     │         │ id           │
│ createdAt    │         │ cartId (FK)  │
└──────────────┘         │ productId(FK)│
                         │ quantity     │
┌──────────────┐         │ createdAt    │
│ RefreshToken │         │ updatedAt    │
├──────────────┤         └──────────────┘
│ id           │
│ token ◄──UQ  │
│ userId (FK)  │
│ expiresAt    │
│ createdAt    │
└──────────────┘
```

#### ⭐ Quyết định thiết kế QUAN TRỌNG cho Multi-Vendor:

| Quyết định                      | Giải thích                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Order có `shopId`**           | Mỗi đơn hàng thuộc về 1 shop. Nếu user mua từ 2 shop khác nhau trong 1 lần checkout → tạo 2 đơn hàng riêng biệt (giống Shopee) |
| **ProductImage tách bảng**      | Thay vì lưu JSON array trong Product. Dễ query, dễ sort, dễ set ảnh primary                                                    |
| **Coupon có `shopId` nullable** | `shopId = null` → coupon của platform (admin tạo). `shopId = 'xxx'` → coupon của shop                                          |
| **Review yêu cầu `orderId`**    | Chỉ cho phép review khi đã mua hàng. Tránh fake review                                                                         |
| **RBAC thay cho `role` enum**   | KHÔNG lưu `role` trực tiếp trên User. Dùng `UserRoles` (User ↔ Role) + `RolePermissions` (Role ↔ Permission). 1 user có thể có nhiều vai trò. Enum `ROLE`: `CUSTOMER / SELLER / ADMIN / DELIVERY_PERSON` |
| **Tách `Profile` khỏi `User`**  | `User` chỉ giữ dữ liệu xác thực (email, password?, provider). `fullName`, `avatarUrl`, `phoneNumber`, `dateOfBirth`, `gender` nằm ở `Profile` (quan hệ 1-1) |
| **`User.provider`**             | `CREDENTIALS` (email/password) hoặc `GOOGLE` (OAuth). Vì vậy `password` là **nullable** |
| **Address polymorphic**         | 1 bảng `Address` dùng chung cho cả User và Shop qua `ownerId` + `ownerType` (USER \| SHOP). `label` phân loại (HOME/OFFICE/PICKUP/BUSINESS/OTHER). Chỉ có `provinceId` + `wardID` (không tách `district`) |
| **Shop: 2 trạng thái tách biệt** | `approvalStatus` (PENDING → APPROVED/REJECTED, kèm `rejectedReason`) là bước admin duyệt; `status` (ACTIVE/SUSPENDED/INACTIVE) là trạng thái vận hành. Có `deletedAt` để soft delete |
| **DeliveryPerson**              | Người giao hàng (role `DELIVERY_PERSON`) là 1 model riêng, cũng dùng `approvalStatus` + `status`, thêm `activityStatus` (ONLINE/OFFLINE/BUSY) |

#### ⚠️ Lỗi fresher thường mắc:

- **Không tách Order theo Shop:** User mua 3 sản phẩm từ 2 shop khác nhau → tạo 1 đơn hàng duy nhất. Vấn đề: Shop A giao hàng xong nhưng Shop B chưa giao, trạng thái đơn hàng phải là gì? KHÔNG CÓ CÁCH XỬ LÝ. Phải tách 1 checkout → N orders (1 per shop).
- **Thiếu snapshot trong OrderItem:** Em PHẢI lưu `productName`, `productPrice`, `productImage` tại thời điểm đặt hàng. Nếu sau đó seller đổi giá hoặc xóa sản phẩm, đơn hàng cũ vẫn phải hiển thị đúng.
- **Dùng `Float` cho price:** Lỗi kinh điển. Dùng `Decimal(10, 2)`.

#### ✅ Definition of Done:

- [✅] ERD vẽ xong trên dbdiagram.io
- [✅] Export ảnh vào `docs/erd/`
- [✅] Tất cả bảng có relationships rõ ràng
- [✅] Đã review snapshot pattern cho OrderItem

---

### Task 2.2: Thiết Kế Target Prisma Schema (3-4h)

> [!IMPORTANT]
> Để học cách phát triển DB thực tế theo phương pháp cuốn chiếu, chúng ta **CHƯA** copy toàn bộ schema dưới đây vào file `prisma/schema.prisma`.
> Đây là **Target Schema** (Schema mục tiêu) để em tham khảo cấu hình cuối cùng. Trong phase này, chúng ta chỉ cài đặt Prisma và khởi tạo nó.
> Việc đưa các model vào schema và chạy migration sẽ được hướng dẫn chi tiết ở từng phase tiếp theo.

#### Cài đặt và Khởi tạo Prisma:

```bash
cd server
npm install prisma -D
npm install @prisma/client
npx prisma init
```

Lúc này file `prisma/schema.prisma` được tạo ra. Hãy tạm thời giữ nguyên hoặc chỉ cấu hình phần `datasource db` kết nối đến PostgreSQL.

#### Sơ đồ Schema mục tiêu (Target Schema):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

// Xác thực bằng email/password hay OAuth (Google)
enum UserProvider {
  CREDENTIALS
  GOOGLE
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

// RBAC: tên vai trò. KHÔNG lưu role trực tiếp trên User —
// user ↔ role là quan hệ nhiều-nhiều qua bảng UserRoles.
enum ROLE {
  CUSTOMER
  SELLER
  ADMIN
  DELIVERY_PERSON
}

// Địa chỉ dùng chung cho cả User và Shop (polymorphic)
enum AddressOwnerType {
  USER
  SHOP
}

enum AddressLabel {
  HOME
  OFFICE
  PICKUP
  BUSINESS
  OTHER
}

// Trạng thái duyệt (dùng cho Shop và DeliveryPerson)
enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

// Trạng thái hoạt động (dùng cho Shop và DeliveryPerson)
enum ShopStatus {
  ACTIVE
  SUSPENDED
  INACTIVE
}

enum VehicleType {
  CAR
  MOTORBIKE
  BICYCLE
  TRUCK
}

enum DeliveryActivityStatus {
  ONLINE
  OFFLINE
  BUSY
}

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

enum CouponType {
  PERCENTAGE   // Giảm %
  FIXED_AMOUNT // Giảm số tiền cố định
}

// ==================== MODELS ====================

// ---------- CORE AUTH (đã migrate) ----------

model User {
  id        String       @id @default(uuid())
  email     String       @unique
  password  String?      // nullable: user OAuth (Google) không có password
  provider  UserProvider @default(CREDENTIALS)
  isActive  Boolean      @default(true)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  // Thông tin cá nhân tách sang Profile (1-1), KHÔNG nằm trên User
  profile        Profile?
  refreshTokens  RefreshToken[]
  roles          UserRoles[]      // RBAC: user có nhiều vai trò
  addresses      Address[]
  shop           Shop?
  deliveryPerson DeliveryPerson?

  @@index([email])
  @@map("users")
}

model Profile {
  id          String    @id @default(uuid())
  userId      String    @unique
  fullName    String
  avatarUrl   String?
  phoneNumber String?
  dateOfBirth DateTime?
  gender      Gender?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ---------- RBAC (đã migrate) ----------

model Role {
  id          String   @id @default(uuid())
  name        ROLE     @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userRoles       UserRoles[]
  rolePermissions RolePermissions[]

  @@index([name])
  @@map("roles")
}

model UserRoles {
  userId String
  roleId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([roleId])
  @@map("user_roles")
}

model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  rolePermissions RolePermissions[]

  @@index([name])
  @@map("permissions")
}

model RolePermissions {
  roleId       String
  permissionId String

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

// ---------- ADDRESS — polymorphic cho cả User và Shop (đã migrate) ----------

model Address {
  id            String           @id @default(uuid())
  ownerId       String           // ID của User HOẶC Shop
  ownerType     AddressOwnerType // USER | SHOP
  recipientName String
  phone         String
  street        String           // Số nhà, tên đường
  wardID        String           // Mã phường/xã
  provinceId    String           // Mã tỉnh/thành (KHÔNG tách district riêng)
  isDefault     Boolean          @default(false)
  label         AddressLabel
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  user User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, ownerType])
  @@map("addresses")
}

// ---------- SHOP (đã migrate) ----------

model Shop {
  id             String         @id @default(uuid())
  ownerId        String         @unique // 1 user = 1 shop
  shopName       String
  logoUrl        String?
  rating         Float          @default(0) // 0.0 - 5.0 (giá trị trung bình)
  approvalStatus ApprovalStatus @default(PENDING) // admin duyệt shop
  rejectedReason String?
  status         ShopStatus     @default(ACTIVE)  // trạng thái vận hành
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?      // soft delete

  user User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  // Quan hệ tới các model thương mại (products/orders/coupons) sẽ được
  // bổ sung khi các model đó được migrate ở các phase sau.

  @@index([ownerId])
  @@map("shops")
}

// ---------- DELIVERY (đã migrate) ----------

model DeliveryPerson {
  id                  String                 @id @default(uuid())
  userId              String                 @unique
  vehicleType         VehicleType
  vehicleLicensePlate String
  vehicleColor        String
  approvalStatus      ApprovalStatus         @default(PENDING)
  rejectedReason      String?
  activityStatus      DeliveryActivityStatus @default(OFFLINE)
  status              ShopStatus             @default(ACTIVE)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("delivery_persons")
}

// ==================== MODELS THƯƠNG MẠI (PLANNED — chưa migrate) ====================
// Các model dưới đây là thiết kế mục tiêu, sẽ được đưa vào schema + migrate dần ở
// các phase 5–10. Khi migrate, nhớ bổ sung back-relation tương ứng vào các model
// core ở trên (ví dụ: Shop.products, Shop.orders, Shop.coupons, User.orders, ...).

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  image       String?
  parentId    String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)

  products Product[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([parentId])
  @@map("categories")
}

model Product {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String?  @db.Text
  price        Decimal  @db.Decimal(12, 2)
  comparePrice Decimal? @db.Decimal(12, 2) // Giá gốc (để hiện "Giảm 20%")
  sku          String   @unique
  stock        Int      @default(0)

  // Foreign keys
  shopId     String
  shop       Shop     @relation(fields: [shopId], references: [id])
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])

  // Metadata
  isActive   Boolean @default(true)
  isFeatured Boolean @default(false)
  soldCount  Int     @default(0)

  // Relations
  images        ProductImage[]
  orderItems    OrderItem[]
  reviews       Review[]
  wishlistItems Wishlist[]
  cartItems     CartItem[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([slug])
  @@index([shopId])
  @@index([categoryId])
  @@index([price])
  @@index([createdAt])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0)
  isPrimary Boolean @default(false)

  @@index([productId])
  @@map("product_images")
}

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
  discount      Decimal       @default(0) @db.Decimal(12, 2) // Giảm giá từ coupon
  totalAmount   Decimal       @db.Decimal(12, 2) // = subtotal + shipping - discount
  addressId     String
  address       Address       @relation(fields: [addressId], references: [id])
  paymentMethod PaymentMethod @default(COD)
  paymentStatus PaymentStatus @default(PENDING)
  couponId      String?
  coupon        Coupon?       @relation(fields: [couponId], references: [id])
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
  // === SNAPSHOT DATA (KHÔNG BAO GIỜ THAY ĐỔI SAU KHI TẠO) ===
  productName  String
  productPrice Decimal @db.Decimal(12, 2)
  productImage String?
  // ============================================================
  quantity     Int
  subtotal     Decimal @db.Decimal(12, 2) // = productPrice * quantity

  @@index([orderId])
  @@map("order_items")
}

model Review {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  orderId   String  // Phải mua hàng mới được review
  rating    Int     // 1-5
  comment   String? @db.Text
  images    Json    @default("[]") // Array of image URLs

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId, orderId]) // 1 user chỉ review 1 lần per order
  @@index([productId])
  @@index([userId])
  @@map("reviews")
}

model Wishlist {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, productId]) // Không thể yêu thích trùng
  @@index([userId])
  @@map("wishlists")
}

model Coupon {
  id           String     @id @default(cuid())
  code         String     @unique
  shopId       String?    // null = platform coupon (admin tạo)
  shop         Shop?      @relation(fields: [shopId], references: [id])
  type         CouponType
  value        Decimal    @db.Decimal(12, 2) // Giá trị: 10% hoặc 50000đ
  minOrderValue Decimal?  @db.Decimal(12, 2) // Đơn tối thiểu
  maxDiscount  Decimal?   @db.Decimal(12, 2) // Giảm tối đa (cho %)
  usageLimit   Int?       // Số lần dùng tối đa (null = không giới hạn)
  usedCount    Int        @default(0)
  startDate    DateTime
  endDate      DateTime
  isActive     Boolean    @default(true)

  orders Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([shopId])
  @@map("coupons")
}
```

> [!NOTE]
> `RefreshToken` đã nằm trong nhóm **CORE AUTH** ở trên (không lặp lại ở đây).

#### ⚠️ Lỗi fresher hay mắc:

- **Quên `@unique` cho `shopId` trong User → Shop:** Nếu không unique, 1 user có thể tạo nhiều shop. Marketplace thường giới hạn 1 user = 1 shop.
- **Dùng `Decimal(10, 2)` cho VNĐ:** Đồng Việt Nam có thể lên tới hàng tỷ. `Decimal(10, 2)` max = 99,999,999.99 → không đủ! Dùng `Decimal(12, 2)` hoặc `Decimal(14, 0)` nếu lưu dạng đồng nguyên.
- **Thiếu `onDelete: Cascade`:** Khi xóa User, CartItem và Wishlist phải bị xóa theo. Nếu không set, Prisma sẽ block việc xóa User.
- **Quên `@@unique` cho CartItem:** Nếu không có `@@unique([cartId, productId])`, user có thể thêm cùng 1 sản phẩm 2 lần thành 2 rows riêng, gây ra nhiều bug.

#### ✅ Definition of Done:

- [ ] Schema viết xong, không có syntax error
- [ ] `npx prisma validate` pass
- [ ] Tất cả enum đã định nghĩa
- [ ] Tất cả index đã đánh cho FK và cột hay query

---

### Task 2.3: Tạo Prisma Client Singleton & Kiểm Tra Kết Nối (2h)

> [!NOTE]
> Vì file `schema.prisma` hiện tại chưa có model nào (rỗng), việc chạy `npx prisma migrate dev` lúc này chưa tạo ra bảng nào và đó là điều hoàn toàn bình thường.
> Chúng ta sẽ viết file Prisma Client Singleton và kiểm tra xem ứng dụng có kết nối thành công đến PostgreSQL database (Docker hoặc Local) hay không.

#### Tạo `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

#### Kết nối DB trong `server.ts` bằng raw query:

Vì chưa có các hàm ORM (như `prisma.user`), ta có thể gọi `prisma.$connect()` và thực hiện một câu query thô đơn giản để test kết nối:

```typescript
import { prisma } from "@/lib/prisma";

const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    // Test query thô để chắc chắn DB phản hồi
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");

    app.listen(env.PORT, () => {
      /* ... */
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};
```

#### ⚠️ Lỗi fresher hay mắc:

- **`new PrismaClient()` ở nhiều file:** Mỗi instance = 1 connection pool = 10 connections mặc định. 5 file = 50 connections → PostgreSQL mặc định chỉ cho 100 connections → sập. LUÔN dùng singleton.
- **Quên `prisma.$disconnect()` trong graceful shutdown:** Để zombie connections cho tới khi DB timeout.

#### ✅ Definition of Done:

- [ ] Prisma client singleton được tạo đúng chỗ.
- [ ] Server log "Database connected successfully" khi khởi động.
- [ ] Quá trình graceful shutdown gọi `await prisma.$disconnect()`.

---

### Task 2.4: Chuẩn Bị Cấu Trúc Seed Data (2h)

Trong phase này, do chưa có bảng nào được tạo, chúng ta **CHƯA** chạy seeding dữ liệu thực tế. Tuy nhiên, để chuẩn bị cho các phase sau, em cần tạo sẵn cấu trúc file `prisma/seed.ts` và tích hợp cấu hình chạy seed vào `package.json`.

#### File `prisma/seed.ts` khởi tạo:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database initialized...");
  // Các seed function cho từng phase sẽ được gọi/viết trực tiếp ở đây
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

#### Cấu hình chạy seed trong `package.json` ở server:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Cài đặt dependencies hỗ trợ (sẽ dùng khi bắt đầu seed User ở Phase 3):**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs ts-node
```

#### ✅ Definition of Done:

- [ ] File `prisma/seed.ts` được tạo đúng cấu trúc rỗng.
- [ ] `package.json` có cấu hình `"prisma": { "seed": ... }`.

---

## 🏁 Checklist Cuối Phase 2

- [ ] ERD vẽ xong toàn bộ hệ thống để lấy context, export vào `docs/erd/`
- [ ] Thiết kế xong Target Prisma Schema làm tài liệu tham khảo cho dự án
- [ ] Khởi tạo Prisma thành công trong thư mục `server/`
- [ ] Prisma Client singleton tạo xong trong `src/lib/prisma.ts`
- [ ] Server test connection thành công đến DB PostgreSQL khi startup qua `prisma.$connect()` và raw query
- [ ] Cấu trúc file `prisma/seed.ts` được chuẩn bị sẵn sàng
- [ ] Graceful shutdown đóng kết nối DB thành công
- [ ] Commit: "chore: initialize database design and prisma connection setup"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                      | Link                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| Prisma Schema Reference     | https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference |
| Prisma Relations            | https://www.prisma.io/docs/concepts/components/prisma-schema/relations     |
| Database Normalization      | https://www.guru99.com/database-normalization.html                         |
| Marketplace Database Design | https://www.vertabelo.com/blog/a-database-model-for-an-online-marketplace/ |
