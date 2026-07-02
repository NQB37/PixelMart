# 📦 PHASE 5: Product Management — Seller Side

> **Prerequisite:** Phase 4 hoàn thành (Shop module, isShopOwner middleware).

---

## 🎯 MVP Của Phase Này

- Seller CRUD sản phẩm (thêm, sửa, xóa mềm, xem danh sách)
- Admin quản lý categories (thêm, sửa, sắp xếp, danh mục cha-con)
- Upload ảnh sản phẩm lên Cloud (Cloudinary)
- Seller chỉ quản lý sản phẩm của shop mình
- Soft Delete: sản phẩm bị "xóa" vẫn còn trong DB, đơn hàng cũ không bị ảnh hưởng

---

## 🗄️ Database Changes (MVP)

Trong phase này, chúng ta tạo danh mục (`Category`) và sản phẩm (`Product`) đi kèm hình ảnh sản phẩm (`ProductImage`).

### 1. Thêm Vào `prisma/schema.prisma`:

```prisma
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
```

Hãy nhớ cập nhật liên kết `products Product[]` trong model `Shop` cũ:

```prisma
model Shop {
  // ... các trường cũ giữ nguyên
  products Product[]
}
```

### 2. Chạy Migration:

```bash
npx prisma migrate dev --name add_products
```

### 3. Viết Seed Data Cho `prisma/seed.ts`:

Cập nhật file `prisma/seed.ts` để seed thêm categories và products:

```typescript
import { PrismaClient, Role, ShopStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Phase 5...");
  const hashedPassword = await bcrypt.hash("Password@123", 12);

  // 1. Seed Seller & Shop
  const seller = await prisma.user.upsert({
    where: { email: "seller1@pixelmart.com" },
    update: {},
    create: {
      email: "seller1@pixelmart.com",
      password: hashedPassword,
      fullName: "Nguyễn Văn Seller",
      role: Role.SELLER,
    },
  });

  const shop = await prisma.shop.upsert({
    where: { slug: "tech-store" },
    update: {},
    create: {
      name: "Tech Store Official",
      slug: "tech-store",
      ownerId: seller.id,
      status: ShopStatus.ACTIVE,
    },
  });

  // 2. Seed Categories
  const catElectronics = await prisma.category.upsert({
    where: { slug: "dien-tu" },
    update: {},
    create: {
      name: "Điện tử",
      slug: "dien-tu",
      sortOrder: 1,
    },
  });

  const catPhones = await prisma.category.upsert({
    where: { slug: "dien-thoai" },
    update: {},
    create: {
      name: "Điện thoại",
      slug: "dien-thoai",
      parentId: catElectronics.id,
      sortOrder: 1,
    },
  });

  // 3. Seed Products
  await prisma.product.upsert({
    where: { slug: "iphone-15-pro-max-256gb" },
    update: {},
    create: {
      name: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max-256gb",
      description: "Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A",
      price: 29990000,
      comparePrice: 34990000,
      sku: "IP15PM-256-BK",
      stock: 50,
      shopId: shop.id,
      categoryId: catPhones.id,
      isFeatured: true,
    },
  });

  console.log("✅ Seeding Phase 5 complete!");
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

### Task 5.1: Category CRUD — Admin Only (3-4h)

#### `src/modules/category/category.validation.ts`:

```typescript
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();
```

#### `src/modules/category/category.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateSlug } from "@/utils/generateSlug";

class CategoryService {
  /**
   * Lấy danh mục dạng cây (tree)
   * Trả về categories cha kèm children
   */
  async getCategoryTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null }, // Chỉ lấy root categories
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return categories;
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });

    if (!category || !category.isActive) {
      throw ApiError.notFound("Danh mục không tồn tại");
    }

    return category;
  }

  async createCategory(data: any) {
    let slug = generateSlug(data.name);
    const slugExists = await prisma.category.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Nếu có parentId, check parent tồn tại
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw ApiError.notFound("Danh mục cha không tồn tại");
    }

    return prisma.category.create({
      data: { ...data, slug },
    });
  }

  async updateCategory(id: string, data: any) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound("Danh mục không tồn tại");

    // Nếu đổi tên → cập nhật slug
    if (data.name && data.name !== category.name) {
      data.slug = generateSlug(data.name);
    }

    // Không cho phép tạo circular reference
    if (data.parentId === id) {
      throw ApiError.badRequest("Danh mục không thể là cha của chính nó");
    }

    return prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    // Check có sản phẩm nào thuộc category này không
    const productCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw ApiError.conflict(
        `Không thể xóa danh mục đang có ${productCount} sản phẩm. Hãy di chuyển sản phẩm sang danh mục khác trước.`,
      );
    }

    // Soft delete: chỉ ẩn, không xóa
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const categoryService = new CategoryService();
```

#### ⚠️ Lỗi fresher hay mắc:

- **Circular reference:** Category A là con của B, rồi B lại là con của A → infinite loop khi render tree. Phải check trước khi lưu.
- **Xóa category có sản phẩm:** Sản phẩm mất category → hiện "Uncategorized" hoặc crash. Phải check trước khi xóa.
- **Recursive query hiệu năng kém:** Nếu category tree sâu >3 levels, include nested sẽ chậm. Giới hạn depth hoặc dùng Materialized Path pattern.

---

### Task 5.2: Product Service — Seller CRUD (4-5h)

#### `src/modules/product/product.validation.ts`:

```typescript
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm tối thiểu 3 ký tự").max(200).trim(),
  description: z.string().max(5000).optional(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  comparePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU là bắt buộc").max(50).trim(),
  stock: z.number().int().min(0, "Số lượng tồn kho không âm").default(0),
  categoryId: z.string().cuid("Category ID không hợp lệ"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .min(1, "Cần ít nhất 1 ảnh sản phẩm")
    .max(10, "Tối đa 10 ảnh")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(["createdAt", "price", "soldCount", "name"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isActive: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
```

#### `src/modules/product/product.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { generateSlug } from "@/utils/generateSlug";
import { CreateProductInput, ProductQuery } from "./product.validation";
import { Prisma } from "@prisma/client";

class ProductService {
  /**
   * Seller tạo sản phẩm mới cho shop của mình
   */
  async createProduct(shopId: string, data: CreateProductInput) {
    // 1. Validate category tồn tại
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category || !category.isActive) {
      throw ApiError.notFound("Danh mục không tồn tại");
    }

    // 2. Check SKU trùng
    const skuExists = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (skuExists) {
      throw ApiError.conflict(`SKU "${data.sku}" đã tồn tại`);
    }

    // 3. Tạo slug
    let slug = generateSlug(data.name);
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 4. Tách images ra khỏi product data
    const { images, ...productData } = data;

    // 5. Tạo product + images trong transaction
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        shopId,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                alt: img.alt || data.name,
                isPrimary: img.isPrimary || index === 0,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true, slug: true } },
      },
    });

    return product;
  }

  /**
   * Seller xem danh sách sản phẩm của shop mình
   */
  async getShopProducts(shopId: string, query: ProductQuery) {
    const { page, limit, search, categoryId, sortBy, sortOrder, isActive } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      shopId,
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            rating: true,
          },
        },
      },
    });

    if (!product) throw ApiError.notFound("Sản phẩm không tồn tại");
    return product;
  }

  /**
   * Seller cập nhật sản phẩm
   */
  async updateProduct(
    id: string,
    shopId: string,
    data: Partial<CreateProductInput>,
  ) {
    // Verify ownership
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.shopId !== shopId) {
      throw ApiError.forbidden("Bạn không có quyền chỉnh sửa sản phẩm này");
    }

    const { images, ...productData } = data;

    // Nếu đổi tên → cập nhật slug
    if (productData.name && productData.name !== product.name) {
      let slug = generateSlug(productData.name);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
      (productData as any).slug = slug;
    }

    // Check SKU trùng (nếu đổi)
    if (productData.sku && productData.sku !== product.sku) {
      const skuExists = await prisma.product.findFirst({
        where: { sku: productData.sku, id: { not: id } },
      });
      if (skuExists)
        throw ApiError.conflict(`SKU "${productData.sku}" đã tồn tại`);
    }

    return prisma.product.update({
      where: { id },
      data: productData,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
      },
    });
  }

  /**
   * SOFT DELETE — không xóa hẳn khỏi DB
   */
  async deleteProduct(id: string, shopId: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.shopId !== shopId) {
      throw ApiError.forbidden("Bạn không có quyền xóa sản phẩm này");
    }

    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

export const productService = new ProductService();
```

#### ⚠️ Lỗi fresher hay mắc trong Product Management:

1. **Hard Delete sản phẩm:**

   ```typescript
   // ❌ SAI — OrderItem reference đến product sẽ bị lỗi
   await prisma.product.delete({ where: { id } });

   // ✅ ĐÚNG — Soft Delete
   await prisma.product.update({
     where: { id },
     data: { deletedAt: new Date(), isActive: false },
   });
   ```

2. **Không check ownership:**

   ```typescript
   // ❌ SAI — Seller A có thể sửa sản phẩm của Seller B
   await prisma.product.update({ where: { id }, data });

   // ✅ ĐÚNG — Luôn verify shopId
   const product = await prisma.product.findUnique({ where: { id } });
   if (product.shopId !== sellerShopId) throw ApiError.forbidden(...);
   ```

3. **Trust client gửi price khi tạo sản phẩm:** Seller là người đặt giá, nên ở đây `price` từ client là hợp lệ. Nhưng khi BUYER đặt hàng (Phase 8), giá phải lấy từ DB, KHÔNG từ client.

4. **Quên filter `deletedAt: null`:** Sau khi soft delete, sản phẩm vẫn hiện trong danh sách nếu query không filter.

---

### Task 5.3: Upload Ảnh — Cloudinary Integration (3-4h)

```bash
npm install cloudinary multer
npm install -D @types/multer
```

#### `src/config/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

> Thêm env vars vào `env.ts` schema và `.env`.

#### `src/modules/upload/upload.service.ts`:

```typescript
import { cloudinary } from "@/config/cloudinary";
import { ApiError } from "@/utils/ApiError";

class UploadService {
  async uploadImage(file: Express.Multer.File, folder = "products") {
    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw ApiError.badRequest("Chỉ chấp nhận file JPEG, PNG hoặc WebP");
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw ApiError.badRequest("Kích thước file tối đa 2MB");
    }

    // Upload lên Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `pixelmart/${folder}`,
          transformation: [
            { width: 800, height: 800, crop: "limit" }, // Resize
            { quality: "auto:good" }, // Auto quality
            { format: "webp" }, // Convert to WebP
          ],
        },
        (error, result) => {
          if (error) reject(ApiError.internal("Upload ảnh thất bại"));
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
            width: result!.width,
            height: result!.height,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }
}

export const uploadService = new UploadService();
```

#### `src/config/multer.ts`:

```typescript
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(), // Lưu trong RAM tạm, không lưu ổ đĩa
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 10, // Tối đa 10 ảnh
  },
});
```

#### `src/modules/upload/upload.routes.ts`:

```typescript
import { Router } from "express";
import { upload } from "@/config/multer";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { uploadService } from "./upload.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";

const router = Router();

// Upload single image
router.post(
  "/image",
  isAuthenticated,
  authorize("SELLER", "ADMIN"),
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    const result = await uploadService.uploadImage(req.file);
    ApiResponse.created(res, result, "Upload ảnh thành công");
  }),
);

// Upload multiple images
router.post(
  "/images",
  isAuthenticated,
  authorize("SELLER", "ADMIN"),
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    const results = await Promise.all(
      files.map((file) => uploadService.uploadImage(file)),
    );
    ApiResponse.created(
      res,
      results,
      `Upload ${results.length} ảnh thành công`,
    );
  }),
);

export const uploadRoutes = router;
```

#### ⚠️ Lỗi fresher hay mắc:

- **Lưu ảnh trên server local:** Deploy lên Heroku/Railway → ảnh biến mất vì filesystem ephemeral. Luôn dùng cloud storage.
- **Không resize/compress ảnh:** User upload ảnh 10MB → page load chậm, tốn tiền bandwidth cloud. Auto resize + WebP conversion giảm 5-10x.
- **Không validate file type:** User upload `.exe` đổi extension thành `.jpg` → security risk. Check `mimetype` chứ không chỉ extension.

---

### Task 5.4: Product Controller & Routes (2-3h)

#### `src/modules/product/product.routes.ts`:

```typescript
import { Router } from "express";
import * as productController from "./product.controller";
import { isAuthenticated } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { isShopOwner } from "@/middlewares/shopOwner.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";

const router = Router();

// === PUBLIC ===
// (Sẽ chi tiết ở Phase 6 — Buyer side)
router.get("/", productController.getPublicProducts);
router.get("/:slug", productController.getProductBySlug);

// === SELLER (cần shop active) ===
router.post(
  "/",
  isAuthenticated,
  authorize("SELLER"),
  isShopOwner,
  validate(createProductSchema),
  productController.createProduct,
);

router.get(
  "/seller/my-products",
  isAuthenticated,
  authorize("SELLER"),
  isShopOwner,
  productController.getMyProducts,
);

router.put(
  "/:id",
  isAuthenticated,
  authorize("SELLER"),
  isShopOwner,
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  "/:id",
  isAuthenticated,
  authorize("SELLER"),
  isShopOwner,
  productController.deleteProduct,
);

export const productRoutes = router;
```

---

## 🏁 Checklist Cuối Phase 5

- [ ] Admin: CRUD Categories (tree structure hoạt động)
- [ ] Seller: Tạo sản phẩm + upload ảnh → sản phẩm thuộc shop của seller
- [ ] Seller: Xem danh sách sản phẩm (chỉ của shop mình)
- [ ] Seller: Cập nhật sản phẩm (verify ownership)
- [ ] Seller: Xóa sản phẩm (soft delete)
- [ ] Upload: File validation (type + size)
- [ ] Upload: Auto resize + WebP conversion
- [ ] Slug tiếng Việt hoạt động cho cả product và category
- [ ] Sản phẩm bị soft delete không hiện trong public queries
- [ ] Commit: "feat: product management with image upload and category tree"

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề                            | Link                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Cloudinary Node.js SDK            | https://cloudinary.com/documentation/node_integration                                       |
| Multer Documentation              | https://github.com/expressjs/multer                                                         |
| Image Optimization Best Practices | https://web.dev/fast/#optimize-your-images                                                  |
| Prisma Nested Writes              | https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#nested-writes |
