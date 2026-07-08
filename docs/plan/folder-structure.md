# 📁 PIXELMART — FOLDER STRUCTURE PLAN

> Tài liệu này mô tả chi tiết cấu trúc thư mục cho cả **Monolith** (Phase 1–14) và **Microservices** (Phase 15–16+).
> Multi-vendor Marketplace — Express.js + Next.js + Prisma + PostgreSQL.

> [!IMPORTANT]
> 📌 **Thực tế codebase hiện tại (nguồn chân lý).** Sơ đồ chi tiết bên dưới là cấu trúc **mục tiêu**. Phần đã build thật:
> - **`website/`** (pnpm workspace) có thật: `shared` = `@pixelmart/shared` (exports `./auth`, `./ui`, `./styles/theme.css`), `client` (Next.js), `seller` + `admin` (Vite). **`server/`** có thật.
> - **`mobile/`, `services/`, `infra/`, `.github/workflows/`, `.husky/`, `docker-compose*.yml`** là mục tiêu — **chưa tồn tại** (`mobile/` đang trống).
> - Backend hiện có **3 module**: `auth`, `shop`, `upload` (các module khác trong sơ đồ là mục tiêu).
> - Mỗi module = 4 file (`*.controller/routes/service/validation.ts`) + thư mục **`tests/`** — **không** dùng `__tests__/`, và **không** có file `*.types.ts` riêng (type suy ra từ Zod `z.infer` trong `*.validation.ts`).
> - `src/config/` thực tế: `env.ts`, `cors.ts`, `cloudinary.ts` (multer cấu hình inline trong `upload.middleware.ts`; `redis.ts` là mục tiêu Phase 14).
> - Prisma: một file `prisma/seed.ts` (không có thư mục `seeds/`); Prisma Client singleton ở **`src/libs/prisma.ts`**; alias `@/` → `src/`.

---

## MỤC LỤC

1. [Tổng Quan Root Project](#1-tổng-quan-root-project)
2. [Backend — Monolith Structure](#2-backend--monolith-structure)
3. [Frontend — Next.js Structure](#3-frontend--nextjs-structure)
4. [Backend — Microservices Structure](#4-backend--microservices-structure)
5. [Shared Packages](#5-shared-packages)
6. [DevOps & Infrastructure](#6-devops--infrastructure)
7. [Quy Tắc Đặt Tên](#7-quy-tắc-đặt-tên)
8. [Migration Guide: Monolith → Microservices](#8-migration-guide-monolith--microservices)

---

## 1. Tổng Quan Root Project

```
PixelMart/
├── website/                        # 🌐 [Web Space] - Workspace chứa các trang Web (Vite/Next.js)
│   ├── pnpm-workspace.yaml     # Workspace config cho web
│   ├── shared/                 # Thư viện UI & utils dùng chung cho web
│   ├── client/             # Next.js App - Buyer Storefront
│   ├── seller/             # React + Vite SPA - Seller Dashboard
│   └── admin/              # React + Vite SPA - Admin Dashboard
├── mobile/                     # 📱 [Mobile Space] - Workspace chứa các ứng dụng di động Expo
│   ├── pnpm-workspace.yaml     # Workspace config cho mobile
│   ├── shared/                 # Thư viện component & logic dùng chung cho mobile
│   ├── client-mobile/          # Expo App - Buyer mobile client
│   └── delivery-mobile/        # Expo App - Shipper/Delivery client
├── server/                     # Backend — Monolith (Phase 1-14)
├── services/                   # Backend — Microservices (Phase 15+)
├── docs/                       # Tài liệu dự án
│   ├── plan/                   # Các plan chi tiết (file này)
│   ├── api/                    # API documentation (Swagger/OpenAPI exports)
│   └── erd/                    # ERD diagrams
├── infra/                      # DevOps, Docker, K8s configs
│   ├── docker/                 # Dockerfiles cho từng service
│   ├── k8s/                    # Kubernetes manifests
│   ├── nginx/                  # Reverse proxy configs
│   └── scripts/                # Deploy & utility scripts
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       ├── ci.yml              # Lint + Test + Build on PR
│       ├── cd-staging.yml      # Deploy to staging
│       └── cd-production.yml   # Deploy to production
├── .husky/                     # Git hooks (pre-commit, commit-msg)
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── .gitignore
├── .editorconfig               # Chuẩn hóa editor settings
├── README.md
├── LICENSE
└── package.json                # Root package configurations
```

### Tại sao cấu trúc này?

| Thư mục     | Lý do                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `website/`  | Gom nhóm các trang web, dùng pnpm Workspace cục bộ để chia sẻ UI component & utils giữa Buyer, Seller và Admin mà không cần copy code. |
| `mobile/`   | Gom nhóm các ứng dụng di động Expo, dùng pnpm Workspace cục bộ để chia sẻ React Native components & logic.                             |
| `server/`   | Cô lập Backend monolith, có thể phát triển và deploy độc lập.                                                                          |
| `services/` | Chỉ xuất hiện khi chuyển sang microservices (Phase 15+)                                                                                |
| `infra/`    | Tách riêng config hạ tầng, không lẫn với business logic                                                                                |
| `docs/`     | Documentation-as-code, version control cùng source                                                                                     |

---

## 2. Backend — Monolith Structure

> Đây là cấu trúc chính cho **Phase 1–14**. Tổ chức theo **Feature-Based (Module)** thay vì Technical-Based.

```
server/
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Auto-generated migration files
│   │   ├── 20260616_init/
│   │   │   └── migration.sql
│   │   └── 20260623_add_shop/
│   │       └── migration.sql
│   ├── seed.ts                 # Main seed entry point
│   └── seeds/                  # Seed data theo module
│       ├── users.seed.ts
│       ├── categories.seed.ts
│       ├── shops.seed.ts
│       └── products.seed.ts
│
├── src/
│   ├── config/                 # ⚙️ Application configuration
│   │   ├── env.ts              # Environment variables validation (zod)
│   │   ├── cors.ts             # CORS whitelist configuration
│   │   ├── multer.ts           # File upload configuration
│   │   └── redis.ts            # Redis connection config
│   │
│   ├── modules/                # 🧩 Feature modules (CORE BUSINESS LOGIC)
│   │   │
│   │   ├── auth/               # 🔐 Authentication & Authorization
│   │   │   ├── auth.controller.ts      # Route handlers (req → service → res)
│   │   │   ├── auth.service.ts         # Business logic (hash, verify, token)
│   │   │   ├── auth.routes.ts          # Route definitions (POST /login, etc.)
│   │   │   ├── auth.validation.ts      # Input validation schemas (zod)
│   │   │   ├── auth.types.ts           # TypeScript interfaces/types
│   │   │   └── tests/
│   │   │       ├── auth.service.test.ts
│   │   │       └── auth.controller.test.ts
│   │   │
│   │   ├── user/               # 👤 User profile management
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validation.ts
│   │   │   ├── user.types.ts
│   │   │   └── tests/
│   │   │       └── user.service.test.ts
│   │   │
│   │   ├── shop/               # 🏪 Shop/Seller management (Multi-vendor!)
│   │   │   ├── shop.controller.ts
│   │   │   ├── shop.service.ts
│   │   │   ├── shop.routes.ts
│   │   │   ├── shop.validation.ts
│   │   │   ├── shop.types.ts
│   │   │   └── tests/
│   │   │       └── shop.service.test.ts
│   │   │
│   │   ├── category/           # 📂 Product categories (hierarchical)
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── category.validation.ts
│   │   │   ├── category.types.ts
│   │   │   └── tests/
│   │   │       └── category.service.test.ts
│   │   │
│   │   ├── product/            # 📦 Product CRUD + variants
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── product.validation.ts
│   │   │   ├── product.types.ts
│   │   │   ├── variant.service.ts        # Product variant logic
│   │   │   └── tests/
│   │   │       ├── product.service.test.ts
│   │   │       └── variant.service.test.ts
│   │   │
│   │   ├── cart/               # 🛒 Shopping cart (multi-shop)
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.validation.ts
│   │   │   ├── cart.types.ts
│   │   │   └── tests/
│   │   │       └── cart.service.test.ts
│   │   │
│   │   ├── order/              # 📋 Order processing & management
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── order.validation.ts
│   │   │   ├── order.types.ts
│   │   │   └── tests/
│   │   │       └── order.service.test.ts
│   │   │
│   │   ├── payment/            # 💳 Payment integration (COD → VNPAY/Stripe)
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.validation.ts
│   │   │   ├── payment.types.ts
│   │   │   ├── strategies/             # Strategy Pattern cho các cổng TT
│   │   │   │   ├── payment.strategy.ts     # Interface
│   │   │   │   ├── cod.strategy.ts         # COD implementation
│   │   │   │   ├── vnpay.strategy.ts       # VNPAY implementation
│   │   │   │   └── stripe.strategy.ts      # Stripe implementation
│   │   │   └── tests/
│   │   │       └── payment.service.test.ts
│   │   │
│   │   ├── review/             # ⭐ Product reviews & ratings
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   ├── review.routes.ts
│   │   │   ├── review.validation.ts
│   │   │   ├── review.types.ts
│   │   │   └── tests/
│   │   │       └── review.service.test.ts
│   │   │
│   │   ├── wishlist/           # ❤️ Wishlist / Favorites
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── wishlist.service.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   └── tests/
│   │   │       └── wishlist.service.test.ts
│   │   │
│   │   ├── coupon/             # 🎟️ Coupon / Discount codes
│   │   │   ├── coupon.controller.ts
│   │   │   ├── coupon.service.ts
│   │   │   ├── coupon.routes.ts
│   │   │   ├── coupon.validation.ts
│   │   │   ├── coupon.types.ts
│   │   │   └── tests/
│   │   │       └── coupon.service.test.ts
│   │   │
│   │   ├── upload/             # 📸 File upload (Cloudinary/S3)
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── upload.routes.ts
│   │   │   └── tests/
│   │   │       └── upload.service.test.ts
│   │   │
│   │   ├── admin/              # 👑 Admin-only operations
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── tests/
│   │   │       └── admin.service.test.ts
│   │   │
│   │   └── notification/       # 🔔 Email & push notifications
│   │       ├── notification.controller.ts
│   │       ├── notification.service.ts
│   │       ├── notification.routes.ts
│   │       ├── templates/              # Email templates
│   │       │   ├── order-confirmation.hbs
│   │       │   ├── welcome.hbs
│   │       │   └── password-reset.hbs
│   │       └── tests/
│   │           └── notification.service.test.ts
│   │
│   ├── middlewares/            # 🛡️ Express middlewares
│   │   ├── auth.middleware.ts          # JWT verification (isAuthenticated)
│   │   ├── role.middleware.ts          # Role checking (isAdmin, isSeller)
│   │   ├── validate.middleware.ts      # Zod schema validation
│   │   ├── rateLimiter.middleware.ts   # Rate limiting (express-rate-limit)
│   │   ├── errorHandler.middleware.ts  # Global error handler
│   │   ├── notFound.middleware.ts      # 404 handler
│   │   ├── requestLogger.middleware.ts # HTTP request logging
│   │   └── shopOwner.middleware.ts     # Verify seller owns the shop
│   │
│   ├── utils/                  # 🔧 Utility functions (stateless helpers)
│   │   ├── ApiError.ts                 # Custom error class with status codes
│   │   ├── ApiResponse.ts             # Standardized success response
│   │   ├── asyncHandler.ts            # Async route wrapper (auto try-catch)
│   │   ├── generateSlug.ts            # URL-safe slug generation
│   │   ├── generateOrderNumber.ts     # Unique order number: ORD-20260616-XXXX
│   │   ├── pagination.ts             # Pagination helper (offset + cursor)
│   │   ├── token.ts                   # JWT sign/verify helpers
│   │   ├── hash.ts                    # bcrypt hash/compare wrappers
│   │   ├── logger.ts                  # Winston logger setup
│   │   └── constants.ts              # Magic numbers, enums, static values
│   │
│   ├── lib/                    # 📚 External service clients (singletons)
│   │   ├── prisma.ts                  # Prisma Client singleton
│   │   ├── redis.ts                   # Redis client singleton
│   │   ├── cloudinary.ts             # Cloudinary SDK setup
│   │   ├── mailer.ts                 # Nodemailer transporter
│   │   └── i18n.ts                   # i18next configuration
│   │
│   ├── routes/                 # 🗺️ Route aggregator
│   │   └── index.ts                   # Gom tất cả module routes
│   │                                  # app.use('/auth', authRoutes)
│   │                                  # app.use('/products', productRoutes)
│   │                                  # ...
│   │
│   ├── types/                  # 📝 Global TypeScript types
│   │   ├── express.d.ts               # Extend Express Request (req.user)
│   │   ├── environment.d.ts           # Process.env type safety
│   │   └── common.types.ts            # Shared types (PaginationQuery, etc.)
│   │
│   ├── locales/                # 🌐 i18n translation files
│   │   ├── vi/
│   │   │   ├── common.json
│   │   │   ├── product.json
│   │   │   ├── order.json
│   │   │   └── errors.json
│   │   └── en/
│   │       ├── common.json
│   │       ├── product.json
│   │       ├── order.json
│   │       └── errors.json
│   │
│   ├── app.ts                  # Express app setup (middlewares, routes)
│   └── server.ts               # Entry point (listen, graceful shutdown)
│
├── tests/                      # 🧪 Integration & E2E tests
│   ├── setup.ts                # Test environment setup
│   ├── helpers/
│   │   ├── createTestUser.ts
│   │   ├── createTestShop.ts
│   │   └── apiClient.ts        # Supertest wrapper
│   └── integration/
│       ├── auth.integration.test.ts
│       ├── product.integration.test.ts
│       └── order.integration.test.ts

```

## 3. Web Space — Workspace Structure

> Các dự án Web nằm dưới thư mục `website/`, sử dụng pnpm Workspace cục bộ để quản lý dependencies và chia sẻ UI/logic.
> Bao gồm 1 gói dùng chung (`shared/`), 1 app Next.js cho khách hàng (`client/`), và 2 app React + Vite cho Kênh người bán/Quản trị (`seller/`, `admin/`).

```
website/
├── pnpm-workspace.yaml # Định nghĩa workspace cục bộ cho web
│
├── shared/ # 📦 Gói UI và logic dùng chung cho Web
│ ├── package.json # Tên package: @pixelmart/website/client
│ ├── tsconfig.json # Cấu hình TypeScript cho shared module
│ └── src/
│ ├── index.ts # Entry point để export mọi components & utils
│ ├── components/ # 🧱 Thư viện UI chung (React)
│ │ ├── ui/ # shadcn/ui components (button, input, table, dialog...)
│ │ └── shared/ # Các components phức tạp hơn (ProductCard, RatingStars, PriceDisplay...)
│ ├── hooks/ # 🎣 Custom React hooks dùng chung (useAuth, useLocalStorage...)
│ └── utils/ # ⚙️ Axios instance (api client), zod validation schemas, formatters
│
├── client/ # 🛍️ Buyer Storefront (Next.js 15+ App Router)
│ ├── app/ # App router chứa layouts và pages của Buyer
│ │ ├── layout.tsx # Layout chung (Header & Footer)
│ │ ├── page.tsx # Trang chủ "/"
│ │ ├── products/ # Danh sách và chi tiết sản phẩm
│ │ ├── cart/ # Giỏ hàng "/cart"
│ │ └── checkout/ # Thanh toán "/checkout"
│ ├── public/ # Các file tĩnh (logo, banners...)
│ ├── tailwind.config.ts
│ └── package.json # Khai báo dependency: "@pixelmart/website/client": "workspace:_"
│
├── seller/ # 🏪 Seller Dashboard (React + Vite + TS SPA)
│ ├── src/
│ │ ├── main.tsx # Entry point của React app
│ │ ├── App.tsx # Router & layouts chính cho Seller
│ │ ├── pages/ # Trang quản trị sản phẩm, đơn hàng, coupon của Seller
│ │ └── assets/ # Ảnh, icons dùng riêng cho Seller
│ ├── index.html
│ ├── vite.config.ts
│ └── package.json # Khai báo dependency: "@pixelmart/website/client": "workspace:_"
│
└── admin/ # 👑 Admin Panel (React + Vite + TS SPA)
├── src/
│ ├── main.tsx # Entry point
│ ├── App.tsx # Router & layouts chính cho Admin
│ └── pages/ # Quản lý users, phê duyệt shop, báo cáo doanh thu
├── index.html
├── vite.config.ts
└── package.json # Khai báo dependency: "@pixelmart/website/client": "workspace:\*"

```

### Kiến trúc Chia sẻ Code

- **Cơ chế Import:** Các app con import UI/logic từ package shared bằng cú pháp clean:
  `import { Button } from '@pixelmart/website/clientsite/components/ui/button'` hoặc `import { api } from '@pixelmart/website/clientsite/utils/api'`.
- **Đồng bộ CSS (Tailwind v4):** Trong các dự án con, cấu hình Tailwind CSS quét mã nguồn từ thư mục shared để biên dịch các class tiện ích:
  ```css
  @import "tailwindcss";
  @source "../shared/src";
  ```

```
├── .env # ❌ KHÔNG commit (trong .gitignore)
├── .env.example # ✅ PHẢI commit (template)
├── .env.test # Test environment
├── .eslintrc.js
├── .prettierrc
├── jest.config.ts
├── tsconfig.json
├── nodemon.json
│ │ │ └── cartStore.ts # Zustand store
│ │ └── types.ts
│ │
│ ├── product/
│ │ ├── components/
│ │ │ ├── ProductGallery.tsx # Image zoom/carousel
│ │ │ ├── ProductInfo.tsx
│ │ │ ├── ProductVariants.tsx # Size/Color selector
│ │ │ ├── ProductReviews.tsx
│ │ │ ├── RelatedProducts.tsx
│ │ │ └── ProductFilters.tsx
│ │ ├── hooks/
│ │ │ ├── useProducts.ts
│ │ │ └── useProductFilters.ts
│ │ └── types.ts
│ │
│ ├── checkout/
│ │ ├── components/
│ │ │ ├── CheckoutForm.tsx
│ │ │ ├── AddressSelector.tsx
│ │ │ ├── PaymentMethodSelector.tsx
│ │ │ ├── OrderSummary.tsx
│ │ │ └── CouponInput.tsx
│ │ ├── hooks/
│ │ │ └── useCheckout.ts
│ │ └── types.ts
│ │
│ ├── shop/
│ │ ├── components/
│ │ │ ├── ShopBanner.tsx
│ │ │ ├── ShopInfo.tsx
│ │ │ └── ShopProducts.tsx
│ │ └── types.ts
│ │
│ ├── seller/
│ │ ├── components/
│ │ │ ├── DashboardStats.tsx
│ │ │ ├── RevenueChart.tsx
│ │ │ ├── OrderTable.tsx
│ │ │ └── ProductTable.tsx
│ │ ├── hooks/
│ │ │ └── useSellerDashboard.ts
│ │ └── types.ts
│ │
│ └── admin/
│ ├── components/
│ │ ├── AdminDashboardStats.tsx
│ │ ├── PlatformRevenueChart.tsx
│ │ ├── ShopApprovalTable.tsx
│ │ └── UserManagementTable.tsx
│ ├── hooks/
│ │ └── useAdminDashboard.ts
│ └── types.ts
│
├── services/ # 🌐 API client layer
│ ├── api.ts # Axios/Fetch instance (base URL, interceptors)
│ ├── auth.service.ts # login(), register(), refreshToken()
│ ├── product.service.ts # getProducts(), getProductBySlug()
│ ├── shop.service.ts # getShop(), getShopProducts()
│ ├── cart.service.ts # syncCart(), mergeCart()
│ ├── order.service.ts # createOrder(), getOrders()
│ ├── review.service.ts # getReviews(), createReview()
│ ├── coupon.service.ts # validateCoupon(), applyCoupon()
│ ├── upload.service.ts # uploadImage(), deleteImage()
│ └── admin.service.ts # admin-only API calls
│
├── hooks/ # 🎣 Global custom hooks
│ ├── useDebounce.ts
│ ├── useLocalStorage.ts
│ ├── useMediaQuery.ts
│ ├── useInfiniteScroll.ts
│ └── useToast.ts
│
├── stores/ # 🗂️ Global state (Zustand)
│ ├── authStore.ts # User auth state
│ ├── cartStore.ts # Cart state (or in features/cart/)
│ └── uiStore.ts # UI state (sidebar open, theme, language)
│
├── lib/ # 📚 Utility libraries
│ ├── utils.ts # cn() helper from shadcn
│ ├── formatters.ts # formatPrice(), formatDate()
│ ├── validators.ts # Client-side validation helpers
│ ├── constants.ts # API_URL, ROLES, ORDER_STATUS
│ └── i18n.ts # i18next setup
│
├── locales/ # 🌐 Translation files
│ ├── vi.json
│ └── en.json
│
├── providers/ # React context providers
│ ├── AuthProvider.tsx
│ ├── ThemeProvider.tsx
│ ├── I18nProvider.tsx
│ └── QueryProvider.tsx # TanStack Query provider
│
├── public/ # Static assets
│ ├── images/
│ │ ├── logo.svg
│ │ ├── hero-banner.webp
│ │ └── placeholder-product.webp
│ ├── icons/
│ └── fonts/
│
├── styles/ # Additional styles (if needed beyond Tailwind)
│ └── animations.css
│
├── middleware.ts # Next.js middleware (auth redirect, i18n)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json # shadcn/ui config
└── package.json

```

### Giải thích cấu trúc Frontend

```

📐 KIẾN TRÚC 3 TẦNG:

┌─────────────────────────────────────────┐
│ app/ → PAGES (routing) │ Chỉ chứa layout + page files
│ Gọi features/ │ Không chứa business logic
├─────────────────────────────────────────┤
│ features/ → FEATURE LOGIC │ Components + hooks đặc thù
│ components/ → SHARED UI │ UI components tái sử dụng
├─────────────────────────────────────────┤
│ services/ → API LAYER │ Giao tiếp với Backend
│ stores/ → STATE MANAGEMENT │ Global state (Zustand)
│ lib/ → UTILITIES │ Helpers, formatters
└─────────────────────────────────────────┘

```

### Route Groups `()` trong Next.js App Router

```

app/
├── (storefront)/ ← Buyer pages: có Header + Footer
├── (auth)/ ← Auth pages: layout tối giản, không Header
├── (seller)/ ← Seller dashboard: có Sidebar riêng
└── (admin)/ ← Admin panel: có Admin Sidebar riêng

Dấu ngoặc () = Route Group → KHÔNG ảnh hưởng URL
/login ← từ (auth)/login/page.tsx
/seller ← từ (seller)/seller/page.tsx
/admin ← từ (admin)/admin/page.tsx

```

---

## 4. Backend — Microservices Structure

> Cấu trúc này chỉ áp dụng từ **Phase 15+** khi tách monolith.

```

services/ # Microservices root
│
├── api-gateway/ # 🚪 API Gateway (Entry point)
│ ├── src/
│ │ ├── config/
│ │ │ ├── env.ts
│ │ │ ├── routes.config.ts # Route → Service mapping
│ │ │ └── rateLimit.config.ts
│ │ ├── middlewares/
│ │ │ ├── auth.middleware.ts # JWT validation (stateless)
│ │ │ ├── rateLimit.middleware.ts
│ │ │ ├── requestId.middleware.ts # Attach unique request ID
│ │ │ └── proxy.middleware.ts # http-proxy-middleware
│ │ ├── utils/
│ │ │ └── logger.ts
│ │ ├── app.ts
│ │ └── server.ts
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── auth-service/ # 🔐 Authentication Service
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ │ └── auth.controller.ts
│ │ ├── services/
│ │ │ └── auth.service.ts
│ │ ├── routes/
│ │ │ └── auth.routes.ts
│ │ ├── middlewares/
│ │ ├── utils/
│ │ ├── types/
│ │ ├── app.ts
│ │ └── server.ts
│ ├── prisma/ # Riêng DB cho Auth
│ │ ├── schema.prisma # Chỉ có User, RefreshToken
│ │ └── migrations/
│ ├── tests/
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── product-service/ # 📦 Product & Category Service
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ │ ├── product.controller.ts
│ │ │ └── category.controller.ts
│ │ ├── services/
│ │ │ ├── product.service.ts
│ │ │ └── category.service.ts
│ │ ├── routes/
│ │ ├── middlewares/
│ │ ├── events/ # Event publishers
│ │ │ ├── product.events.ts # Publish: product.created, product.updated
│ │ │ └── publisher.ts # RabbitMQ publisher helper
│ │ ├── utils/
│ │ ├── app.ts
│ │ └── server.ts
│ ├── prisma/ # Riêng DB: Product, Category, Variant
│ │ ├── schema.prisma
│ │ └── migrations/
│ ├── tests/
│ ├── Dockerfile
│ └── package.json
│
├── order-service/ # 📋 Order & Payment Service
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ │ ├── order.controller.ts
│ │ │ └── payment.controller.ts
│ │ ├── services/
│ │ │ ├── order.service.ts
│ │ │ └── payment.service.ts
│ │ ├── routes/
│ │ ├── events/
│ │ │ ├── order.events.ts # Publish: order.created, order.paid
│ │ │ └── consumers/ # Consume events from other services
│ │ │ └── product.consumer.ts # Listen: product.priceChanged
│ │ ├── strategies/
│ │ │ ├── cod.strategy.ts
│ │ │ └── vnpay.strategy.ts
│ │ ├── utils/
│ │ ├── app.ts
│ │ └── server.ts
│ ├── prisma/ # Riêng DB: Order, OrderItem, Payment
│ │ ├── schema.prisma
│ │ └── migrations/
│ ├── tests/
│ ├── Dockerfile
│ └── package.json
│
├── shop-service/ # 🏪 Shop & Seller Service
│ ├── src/
│ │ ├── controllers/
│ │ │ └── shop.controller.ts
│ │ ├── services/
│ │ │ └── shop.service.ts
│ │ ├── routes/
│ │ ├── events/
│ │ ├── utils/
│ │ ├── app.ts
│ │ └── server.ts
│ ├── prisma/ # Riêng DB: Shop, ShopSettings
│ ├── tests/
│ ├── Dockerfile
│ └── package.json
│
├── notification-service/ # 🔔 Email & Push Notifications
│ ├── src/
│ │ ├── config/
│ │ ├── consumers/ # ONLY consumes events (no REST API)
│ │ │ ├── order.consumer.ts # Listen: order.created → send email
│ │ │ ├── auth.consumer.ts # Listen: user.registered → welcome email
│ │ │ └── payment.consumer.ts # Listen: payment.success → receipt
│ │ ├── services/
│ │ │ ├── email.service.ts
│ │ │ └── template.service.ts
│ │ ├── templates/ # Email HTML templates
│ │ │ ├── order-confirmation.hbs
│ │ │ ├── welcome.hbs
│ │ │ ├── password-reset.hbs
│ │ │ └── payment-receipt.hbs
│ │ ├── utils/
│ │ └── server.ts # Chỉ start consumers, không listen HTTP
│ ├── Dockerfile
│ └── package.json
│
├── review-service/ # ⭐ Review & Rating (MongoDB)
│ ├── src/
│ │ ├── config/
│ │ ├── models/ # Mongoose models (thay vì Prisma)
│ │ │ └── review.model.ts
│ │ ├── controllers/
│ │ │ └── review.controller.ts
│ │ ├── services/
│ │ │ └── review.service.ts
│ │ ├── routes/
│ │ ├── events/
│ │ │ └── review.events.ts # Publish: review.created
│ │ ├── utils/
│ │ ├── app.ts
│ │ └── server.ts
│ ├── tests/
│ ├── Dockerfile
│ └── package.json
│
└── media-service/ # 📸 Upload & Image Processing
├── src/
│ ├── config/
│ │ └── cloudinary.ts
│ ├── controllers/
│ │ └── upload.controller.ts
│ ├── services/
│ │ ├── upload.service.ts
│ │ └── imageProcessor.service.ts # Sharp: resize, compress, WebP
│ ├── routes/
│ ├── utils/
│ ├── app.ts
│ └── server.ts
├── tests/
├── Dockerfile
└── package.json

```

### Service Communication Map

```

                        ┌──────────────┐
                        │   Client     │
                        │  (Next.js)   │
                        └──────┬───────┘
                               │ HTTPS
                        ┌──────▼───────┐
                        │  API Gateway │ Port 8000
                        │  (Express)   │
                        └──────┬───────┘
                               │ HTTP (internal)
            ┌──────────────────┼──────────────────┐
            │                  │                   │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌───────▼──────┐
     │ Auth Service │  │ Product Svc │   │  Order Svc   │
     │  Port 8001   │  │  Port 8002  │   │  Port 8003   │
     │  [Postgres]  │  │  [Postgres] │   │  [Postgres]  │
     └─────────────┘   └──────┬──────┘   └──────┬───────┘
                               │                  │
                          ┌────▼──────────────────▼────┐
                          │       RabbitMQ             │
                          │    (Message Broker)        │
                          └────┬──────────────────┬────┘
                               │                  │
                    ┌──────────▼──┐        ┌──────▼────────┐
                    │ Review Svc  │        │ Notification  │
                    │ Port 8005   │        │   Service     │
                    │ [MongoDB]   │        │ (No HTTP port)│
                    └─────────────┘        └───────────────┘

     ┌─────────────┐   ┌─────────────┐
     │  Shop Svc   │   │  Media Svc  │
     │  Port 8004  │   │  Port 8006  │
     │ [Postgres]  │   │[Cloudinary] │
     └─────────────┘   └─────────────┘

```

### Database Phân Tách Cho Mỗi Service

| Service         | Database           | Tables/Collections                   | Lý do chọn DB                                               |
| --------------- | ------------------ | ------------------------------------ | ----------------------------------------------------------- |
| Auth Service    | PostgreSQL         | `users`, `refresh_tokens`            | Quan hệ rõ ràng, cần ACID transaction                       |
| Product Service | PostgreSQL         | `products`, `categories`, `variants` | Cần JOIN phức tạp, filter, sort                             |
| Order Service   | PostgreSQL         | `orders`, `order_items`, `payments`  | Transaction critical (tiền bạc!)                            |
| Shop Service    | PostgreSQL         | `shops`, `shop_settings`             | Quan hệ rõ ràng với users                                   |
| Review Service  | **MongoDB**        | `reviews` collection                 | Schema linh hoạt (text, images, nested replies), read-heavy |
| Notification    | Không cần DB       | —                                    | Stateless, chỉ consume events rồi gửi                       |
| Media Service   | Không cần DB riêng | —                                    | Dùng Cloudinary API, metadata lưu ở Product Service         |

---

## 5. Shared Packages

> Code dùng chung giữa các services (khi chuyển sang microservices).

```

packages/
├── shared-types/ # TypeScript types/interfaces
│ ├── src/
│ │ ├── user.types.ts # IUser, IUserPublic
│ │ ├── product.types.ts # IProduct, IProductListItem
│ │ ├── order.types.ts # IOrder, OrderStatus enum
│ │ ├── shop.types.ts # IShop
│ │ ├── api.types.ts # ApiResponse<T>, PaginatedResponse<T>
│ │ └── index.ts # Re-export all
│ ├── package.json
│ └── tsconfig.json
│
├── shared-utils/ # Utility functions
│ ├── src/
│ │ ├── generateSlug.ts
│ │ ├── generateOrderNumber.ts
│ │ ├── formatPrice.ts
│ │ ├── pagination.ts
│ │ └── index.ts
│ ├── package.json
│ └── tsconfig.json
│
├── shared-validators/ # Zod validation schemas
│ ├── src/
│ │ ├── auth.schema.ts # loginSchema, registerSchema
│ │ ├── product.schema.ts # createProductSchema, updateProductSchema
│ │ ├── order.schema.ts
│ │ └── index.ts
│ ├── package.json
│ └── tsconfig.json
│
└── shared-events/ # Event contracts for message queue
├── src/
│ ├── events.ts # Event name constants
│ ├── payloads/
│ │ ├── order.payload.ts
│ │ ├── product.payload.ts
│ │ └── user.payload.ts
│ └── index.ts
├── package.json
└── tsconfig.json

```

**Lưu ý quan trọng:** Packages này chỉ cần thiết khi chuyển sang microservices. Trong phase monolith, các types/utils nằm trực tiếp trong `server/src/`.

---

## 6. DevOps & Infrastructure

```

infra/
├── docker/
│ ├── Dockerfile.client # Multi-stage build cho Next.js
│ ├── Dockerfile.server # Multi-stage build cho Express
│ ├── Dockerfile.gateway # API Gateway
│ ├── Dockerfile.auth # Auth Service
│ ├── Dockerfile.product # Product Service
│ ├── Dockerfile.order # Order Service
│ ├── Dockerfile.notification # Notification Service
│ └── Dockerfile.review # Review Service
│
├── nginx/
│ ├── nginx.conf # Reverse proxy config
│ └── ssl/ # SSL certificates (gitignored)
│
├── k8s/ # Kubernetes manifests
│ ├── namespace.yaml
│ ├── secrets/
│ │ └── db-secrets.yaml # K8s Secrets (encrypted)
│ ├── configmaps/
│ │ └── app-config.yaml
│ ├── deployments/
│ │ ├── client-deployment.yaml
│ │ ├── gateway-deployment.yaml
│ │ ├── auth-deployment.yaml
│ │ ├── product-deployment.yaml
│ │ ├── order-deployment.yaml
│ │ └── notification-deployment.yaml
│ ├── services/
│ │ ├── client-service.yaml
│ │ ├── gateway-service.yaml
│ │ └── ...
│ ├── ingress/
│ │ └── ingress.yaml # Ingress routing rules
│ └── hpa/ # Horizontal Pod Autoscaler
│ ├── gateway-hpa.yaml
│ └── product-hpa.yaml
│
├── monitoring/
│ ├── prometheus/
│ │ └── prometheus.yml
│ ├── grafana/
│ │ ├── dashboards/
│ │ │ ├── overview.json
│ │ │ └── per-service.json
│ │ └── datasources.yml
│ └── loki/
│ └── loki-config.yml
│
└── scripts/
├── setup-dev.sh # Khởi tạo dev environment
├── seed-db.sh # Chạy seed data
├── backup-db.sh # Backup PostgreSQL
└── deploy.sh # Deploy script

```

---

## 7. Quy Tắc Đặt Tên

### Files & Folders

| Loại             | Convention                    | Ví dụ                                   |
| ---------------- | ----------------------------- | --------------------------------------- |
| Folders          | `kebab-case`                  | `order-service/`, `shared-types/`       |
| TypeScript files | `camelCase` hoặc `kebab-case` | `auth.service.ts`, `auth.controller.ts` |
| React components | `PascalCase`                  | `ProductCard.tsx`, `Header.tsx`         |
| Test files       | `*.test.ts` hoặc `*.spec.ts`  | `auth.service.test.ts`                  |
| Config files     | `lowercase`                   | `tsconfig.json`, `.eslintrc.js`         |
| Constants        | `SCREAMING_SNAKE_CASE`        | `MAX_FILE_SIZE`, `ORDER_STATUS`         |

### Module Files Naming Pattern

```

modules/[feature]/
├── [feature].controller.ts # Route handlers
├── [feature].service.ts # Business logic
├── [feature].routes.ts # Route definitions
├── [feature].validation.ts # Zod schemas
├── [feature].types.ts # TypeScript types
└── **tests**/
└── [feature].service.test.ts

```

### Import Order Convention

```typescript
// 1. Node.js built-in modules
import path from "path";

// 2. External packages (npm)
import express from "express";
import { z } from "zod";

// 3. Internal packages (monorepo)
import { IUser } from "@pixelmart/shared-types";

// 4. Internal modules (absolute imports)
import { prisma } from "@/libs/prisma";
import { ApiError } from "@/utils/ApiError";

// 5. Relative imports (same module)
import { authService } from "./auth.service";
```

---

## 8. Migration Guide: Monolith → Microservices

### Phase 1–14: Monolith

```
PixelMart/
├── website/             ← Web Workspace (Next.js + Vite)
├── mobile/          ← Mobile Workspace (Expo)
├── server/          ← Backend MONOLITH (Express + Prisma + PostgreSQL)
├── docs/
└── infra/
```

### Phase 15+: Tách Microservices

```
PixelMart/
├── website/             ← Web Workspace (Next.js + Vite) — KHÔNG ĐỔI
├── mobile/          ← Mobile Workspace (Expo) — KHÔNG ĐỔI
├── server/          ← DEPRECATED (giữ để reference)
├── services/        ← MỚI: Các microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── product-service/
│   ├── order-service/
│   ├── shop-service/
│   ├── notification-service/
│   ├── review-service/
│   └── media-service/
├── packages/        ← MỚI: Shared code
│   ├── shared-types/
│   ├── shared-utils/
│   ├── shared-validators/
│   └── shared-events/
├── docs/
└── infra/
```

### Bước chuyển đổi:

```
MONOLITH                          MICROSERVICES
─────────────                     ─────────────
server/src/modules/auth/    →     services/auth-service/
server/src/modules/product/ →     services/product-service/
server/src/modules/order/   →     services/order-service/
server/src/modules/shop/    →     services/shop-service/
server/src/modules/review/  →     services/review-service/
server/src/modules/upload/  →     services/media-service/
server/src/modules/notify/  →     services/notification-service/

server/src/utils/*          →     packages/shared-utils/
server/src/types/*          →     packages/shared-types/
server/src/modules/*/       →     packages/shared-validators/
  *.validation.ts

1 Database chung              →     Mỗi service 1 DB riêng
Direct function calls         →     HTTP + RabbitMQ
```

> **Quy tắc vàng:** Thiết kế monolith sao cho mỗi module **ĐỘC LẬP TỐI ĐA** — không import trực tiếp service từ module khác. Nếu `orderService` cần data product, gọi qua `productService` interface, không query trực tiếp bảng Product. Khi tách microservice, chỉ cần đổi implementation từ "gọi hàm" sang "gọi HTTP".
