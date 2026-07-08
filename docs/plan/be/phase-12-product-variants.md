# 🎨 PHASE 12: Product Variants (Size, Color, Storage)

> **Độ khó:** ⭐⭐⭐⭐ Advanced
> **Thời lượng ước tính:** 15-20 giờ
> **Prerequisite:** Phase 11 hoàn thành

---

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh path/lệnh cho khớp codebase hiện tại (server mới có `auth`/`shop`/`upload`).

## 🎯 MVP Của Phase Này

- Sản phẩm có thể có multiple variants (Size: S/M/L, Color: Đỏ/Xanh, Storage: 128GB/256GB)
- Mỗi variant combination có: price, stock, SKU riêng
- API chi tiết sản phẩm trả về đầy đủ cấu trúc variants để Frontend xử lý
- Kiểm tra tồn kho và cấm mua variant hết hàng
- Giỏ hàng lưu variant cụ thể (liên kết với ProductVariant)
- Order snapshot bao gồm variant info

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo thêm 4 bảng mới để lưu trữ các thuộc tính sản phẩm biến thể (như Size, Color) và các kết hợp biến thể cụ thể (ProductVariant).

### 1. Thêm Vào `prisma/schema.prisma`:

```prisma
// Nhóm thuộc tính (Size, Color, Storage)
model VariantAttribute {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String   // "Size", "Màu sắc", "Bộ nhớ"
  values    VariantAttributeValue[]
  sortOrder Int      @default(0)

  @@index([productId])
  @@map("variant_attributes")
}

// Giá trị của thuộc tính (S, M, L cho Size)
model VariantAttributeValue {
  id          String           @id @default(cuid())
  attributeId String
  attribute   VariantAttribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  value       String           // "S", "M", "L", "Đỏ", "128GB"
  sortOrder   Int              @default(0)

  variantOptions ProductVariantOption[]

  @@index([attributeId])
  @@map("variant_attribute_values")
}

// Variant cụ thể = 1 combination (Size M + Color Đỏ)
model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku       String  @unique
  price     Decimal @db.Decimal(12, 2) // Giá riêng cho variant
  stock     Int     @default(0)
  isActive  Boolean @default(true)

  options    ProductVariantOption[]
  cartItems  CartItem[]  // CartItem trỏ đến variant thay vì product
  orderItems OrderItem[]

  @@index([productId])
  @@map("product_variants")
}

// Liên kết variant với attribute values (many-to-many)
model ProductVariantOption {
  id              String                @id @default(cuid())
  variantId       String
  variant         ProductVariant        @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attributeValueId String
  attributeValue  VariantAttributeValue @relation(fields: [attributeValueId], references: [id])

  @@unique([variantId, attributeValueId])
  @@map("product_variant_options")
}
```

Cập nhật các liên kết trong các model cũ:

- Trong `Product`: `variants ProductVariant[]`, `variantAttributes VariantAttribute[]`
- Trong `CartItem`: `variantId String?`, `variant ProductVariant? @relation(fields: [variantId], references: [id])`
- Trong `OrderItem`: `variantSku String?`, `variantLabel String?` (Lưu snapshot dạng: "256GB / Natural Titanium")

### 2. Chạy Migration:

```bash
pnpm prisma migrate dev --name add_product_variants
```

#### Ví dụ cấu trúc dữ liệu lưu trong DB:

```
Product: "iPhone 15 Pro Max"
├── VariantAttribute: "Storage"
│   ├── Value: "256GB"
│   └── Value: "512GB"
├── VariantAttribute: "Color"
│   ├── Value: "Natural Titanium"
│   ├── Value: "Blue Titanium"
│   └── Value: "Black Titanium"
│
├── ProductVariant: { sku: "IP15PM-256-NT", price: 29.990.000, stock: 20 }
│   └── Options: ["256GB", "Natural Titanium"]
├── ProductVariant: { sku: "IP15PM-256-BL", price: 29.990.000, stock: 15 }
│   └── Options: ["256GB", "Blue Titanium"]
└── ... (Tổng cộng 6 variants = 2 bộ nhớ × 3 màu sắc)
```

---

## 📋 Task Breakdown

### Task 12.1: Cập Nhật Prisma Schema & Chạy Migration (2h)

Cập nhật schema.prisma và chạy lệnh migrate của Prisma để đồng bộ cấu trúc mới với database PostgreSQL. Đảm bảo chỉnh sửa chính xác các quan hệ với `CartItem` và `OrderItem` để hệ thống không bị lỗi compile TypeScript.

---

### Task 12.2: Variant Service — Backend (4-5h)

Key logic:

- **Tạo variants:** Seller nhập attributes + values → hệ thống có thể auto-generate combinations hoặc seller chọn manual
- **Lấy variant theo selection:** User chọn "256GB" + "Blue" → API trả về variant cụ thể (price, stock)
- **Giá hiển thị trên listing:** Nếu product có variants, hiển thị "từ ₫29.990.000" (giá thấp nhất)
- **Stock check:** Check stock của VARIANT cụ thể, không phải product

### Task 12.3: Cập nhật Cart & Order cho Variants (3-4h)

```typescript
// CartItem cần thêm variantId
model CartItem {
  // ... existing fields
  variantId String?
  variant   ProductVariant? @relation(...)
}

// OrderItem snapshot thêm variant info
model OrderItem {
  // ... existing fields
  variantSku    String?
  variantLabel  String?  // "256GB / Blue Titanium"
}
```

## 🏁 Checklist Cuối Phase 12

- [ ] DB schema: variant attributes, values, product variants
- [ ] Seller: tạo/quản lý variants cho sản phẩm qua API
- [ ] API chi tiết sản phẩm trả về đầy đủ variants và option values
- [ ] Cart lưu variant cụ thể
- [ ] Order snapshot bao gồm variant info
- [ ] Stock check theo variant (không phải product)
- [ ] Listing page API hỗ trợ trả về khoảng giá hoặc giá thấp nhất cho sản phẩm có variants
- [ ] Commit: "feat: product variants with dynamic pricing and stock management"
