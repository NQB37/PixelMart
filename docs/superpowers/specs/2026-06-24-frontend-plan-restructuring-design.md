# 📐 Design Spec: Frontend Plan Restructuring

**Dự án:** PixelMart — Multi-Vendor Marketplace  
**Ngày:** 2026-06-24  
**Trạng thái:** Chờ phê duyệt  
**Mục tiêu:** Tách biệt lộ trình phát triển Frontend (Web) ra khỏi tài liệu Backend, chia nhỏ thành các cổng: Client (Buyer Storefront), Seller Portal, Admin Dashboard và Shared Web Library.

---

## 1. Bối Cảnh & Mục Tiêu

Hiện tại, các tài liệu trong `docs/plan/` (từ Phase 1 đến Phase 16) đang tập trung chủ yếu vào Backend (Express.js, Prisma, Database), với một vài tác vụ Frontend nằm rải rác. Điều này gây khó khăn cho việc phát triển song song và theo dõi tiến độ của các lập trình viên Frontend.

Mục tiêu của thiết kế này là:
- **Tách biệt hoàn toàn:** Đưa tất cả các tác vụ Frontend ra khỏi tài liệu Backend.
- **Phân chia theo cổng:** Tạo kế hoạch chi tiết cho từng phần của hệ thống Frontend Web bao gồm:
  - **Client (Next.js App):** Dành cho khách mua hàng (Buyer), yêu cầu SEO và SSR cao.
  - **Seller (Vite + React SPA):** Dành cho người bán quản lý cửa hàng và sản phẩm.
  - **Admin (Vite + React SPA):** Dành cho ban quản trị vận hành toàn hệ thống.
  - **Shared (local package `@pixelmart/shared-web`):** Thư viện dùng chung chứa Axios client, các common component, helper và validation schema.
- **Đồng bộ tiến độ:** Cấu trúc các file plan theo từng Phase tương ứng với Backend (chỉ tạo file ở những Phase mà cổng đó có nhiệm vụ) giúp dễ dàng đối chiếu và thực hiện.

---

## 2. Thư Mục Kế Hoạch Frontend Mới

Cấu trúc thư mục kế hoạch Frontend sẽ được tổ chức dưới `docs/plan/fe/web/`:

```
docs/plan/fe/web/
├── client/                     # Kế hoạch chi tiết cho Next.js Buyer Storefront
│   ├── phase-01-foundation-setup.md
│   ├── phase-03-authentication.md
│   ├── phase-04-shop-seller.md
│   ├── phase-06-product-display-seo.md
│   ├── phase-07-cart-state.md
│   ├── phase-08-order-checkout.md
│   ├── phase-09-review-rating.md
│   ├── phase-10-wishlist-coupon.md
│   ├── phase-13-i18n.md
│   ├── phase-14-performance-caching.md
│   └── phase-15-docker-cicd-testing.md
│
├── seller/                     # Kế hoạch chi tiết cho Vite Seller Panel
│   ├── phase-01-foundation-setup.md
│   ├── phase-03-authentication.md
│   ├── phase-04-shop-seller.md
│   ├── phase-05-product-management.md
│   ├── phase-12-product-variants.md
│   ├── phase-13-i18n.md
│   └── phase-15-docker-cicd-testing.md
│
├── admin/                      # Kế hoạch chi tiết cho Vite Admin Dashboard
│   ├── phase-01-foundation-setup.md
│   ├── phase-03-authentication.md
│   ├── phase-04-shop-seller.md
│   ├── phase-11-admin-dashboard.md
│   ├── phase-13-i18n.md
│   └── phase-15-docker-cicd-testing.md
│
└── shared/                     # Kế hoạch phát triển thư viện dùng chung (@pixelmart/shared-web)
    ├── phase-01-foundation-setup.md
    ├── phase-03-authentication.md
    └── phase-06-product-display.md
```

---

## 3. Bản Đồ Phân Phối Tác Vụ Theo Phase (Task Mapping)

Dưới đây là chi tiết các task cụ thể sẽ được viết vào từng file plan:

### 3.1 Gói Dùng Chung (`shared/`)
*   **Phase 01: Foundation & Setup**
    *   Khởi tạo cấu trúc package `@pixelmart/shared-web`, thiết lập `package.json` và `tsconfig.json`.
    *   Cài đặt Axios và cấu hình Axios Instance cơ bản (`api.ts`) trỏ tới API URL của Backend, bật `withCredentials: true`.
    *   Tạo Mock Button để test liên kết workspace và viết test verify Axios config.
*   **Phase 03: Authentication**
    *   Cấu hình Axios interceptors để tự động bắt lỗi 401 Unauthorized từ Backend.
    *   Triển khai logic tự động gọi API refresh token (`/auth/refresh`) khi access token hết hạn và thực hiện retry request ban đầu (Refresh Token Rotation).
*   **Phase 06: Product Display & SEO**
    *   Xây dựng các common UI components dùng chung (ProductCard, Spinner, Alert).
    *   Viết custom hooks hỗ trợ chung: `useDebounce`, `useCurrencyFormatter`.

### 3.2 Cổng Client (`client/`)
*   **Phase 01: Foundation & Setup**
    *   Cấu hình Next.js App Router, CSS, tích hợp thư viện shared.
    *   Setup cấu trúc Layout cơ bản (Header, Footer, Navigation, Container).
*   **Phase 03: Authentication**
    *   Tạo giao diện trang Login, Register, Forgot Password.
    *   Cấu hình Next.js middleware để bảo vệ các route riêng tư (profile, orders, checkout) phía Client-side.
*   **Phase 04: Shop & Seller Module**
    *   Xây dựng Form đăng ký mở Shop cho người dùng thường, gửi yêu cầu lên Backend chuyển role thành PENDING_SELLER.
*   **Phase 06: Product Display & SEO**
    *   Trang chủ: banner, danh mục sản phẩm nổi bật, sản phẩm mới.
    *   Trang tìm kiếm và lọc sản phẩm (tìm kiếm theo từ khóa có debounce, lọc theo category, khoảng giá, sắp xếp theo giá/đánh giá).
    *   Trang chi tiết sản phẩm: sử dụng Server-Side Rendering (SSR) để bot tìm kiếm cào được nội dung sản phẩm, thiết lập Metadata tự động.
*   **Phase 07: Cart & State Management**
    *   Cấu hình Zustand store lưu trữ giỏ hàng, kết hợp LocalStorage để lưu giỏ hàng cho khách vãng lai (Guest).
    *   Viết logic đồng bộ (Merge Cart) ngay sau khi đăng nhập thành công.
*   **Phase 08: Order & Checkout**
    *   Trang checkout: điền thông tin giao hàng, chọn phương thức thanh toán.
    *   Logic tích hợp VNPAY/Stripe: gọi API tạo hóa đơn và chuyển hướng người dùng sang trang sandbox ngân hàng.
    *   Màn hình xử lý kết quả thanh toán (IPN fallback) và trang Lịch sử mua hàng + chi tiết đơn hàng.
*   **Phase 09: Review & Rating**
    *   Giao diện viết đánh giá sản phẩm (chọn số sao, nhập bình luận, đính kèm ảnh).
    *   Hiển thị danh sách đánh giá của sản phẩm có phân trang ở trang chi tiết.
*   **Phase 10: Wishlist & Coupon**
    *   Giao diện Wishlist (Sản phẩm yêu thích) đồng bộ Client-DB.
    *   Form nhập mã Coupon giảm giá và áp dụng chiết khấu tại trang Checkout.
*   **Phase 13: i18n**
    *   Cấu hình `next-intl` cho Next.js, viết file dịch JSON cho Tiếng Anh/Tiếng Việt.
*   **Phase 14: Performance Caching**
    *   Tối ưu hóa hình ảnh (`next/image`), Font chữ, Dynamic Import cho các component nặng, tối ưu hóa điểm Core Web Vitals (CWV).
*   **Phase 15: Docker & CI/CD**
    *   Viết Dockerfile chạy Next.js ở chế độ standalone, viết kịch bản test Playwright cho luồng Checkout.

### 3.3 Cổng Seller (`seller/`)
*   **Phase 01: Foundation & Setup**
    *   Khởi tạo dự án Vite React + TypeScript, cấu hình React Router và kết nối `@pixelmart/shared-web`.
*   **Phase 03: Authentication**
    *   Màn hình đăng nhập dành cho Seller, xây dựng Route Guard chặn các role không phải SELLER hoặc ADMIN.
*   **Phase 04: Shop & Seller Module**
    *   Giao diện quản lý thông tin Shop: Form update tên shop, mô tả, logo, banner.
*   **Phase 05: Product Management**
    *   Dashboard Seller: Bảng danh sách sản phẩm (Search, filter, phân trang).
    *   Form thêm/sửa sản phẩm: Tích hợp thư viện form (react-hook-form + zod), upload ảnh trực tiếp lên Backend.
*   **Phase 12: Product Variants**
    *   Giao diện cấu hình biến thể nâng cao (Color, Size, Option khác), sinh tự động danh sách các biến thể để người dùng nhập Giá và Số lượng tồn kho cho từng biến thể.
*   **Phase 13: i18n**
    *   Cấu hình `react-i18next` cho trang Seller.
*   **Phase 15: Docker & CI/CD**
    *   Viết Dockerfile cho SPA chạy qua Nginx, setup Cypress test.

### 3.4 Cổng Admin (`admin/`)
*   **Phase 01: Foundation & Setup**
    *   Khởi tạo dự án Vite React + TypeScript, setup Dashboard layout (Sidebar, Header).
*   **Phase 03: Authentication**
    *   Giao diện Login Admin, Route Guard kiểm tra role `ADMIN` nghiêm ngặt.
*   **Phase 04: Shop & Seller Module**
    *   Giao diện quản lý danh sách Shop đăng ký hoạt động: Xem danh sách Shop PENDING, phê duyệt (ACTIVE) hoặc tạm khóa (SUSPENDED) kèm lý do.
*   **Phase 11: Admin Dashboard & Reports**
    *   Trang chủ Admin: Biểu thị doanh thu toàn hệ thống, số lượng đơn hàng qua biểu đồ Recharts.
    *   Quản lý danh sách người dùng (Block/Unblock user).
*   **Phase 13: i18n**
    *   Đa ngôn ngữ cho Admin Dashboard.
*   **Phase 15: Docker & CI/CD**
    *   Dockerfile (Vite + Nginx), cấu hình CI.

---

## 4. Cấu Trúc Nội Dung Của Mỗi File Plan

Để đảm bảo tính nhất quán với kế hoạch Backend, mỗi file plan của Frontend sẽ bao gồm các mục bắt buộc sau:
1.  **🎯 MVP Của Phase Này:** Giao diện/tính năng phải chạy được sau phase.
2.  **📋 Task Breakdown:** Danh sách các task nhỏ, thời gian dự kiến, mã lệnh/cấu hình mẫu, và lý do tại sao phải chia task như vậy.
3.  **⚠️ Bẫy Fresher (Common Pitfalls):** Chia sẻ các lỗi phổ biến liên quan đến Frontend ở phase đó.
4.  **✅ Definition of Done (DoD):** Checklist rõ ràng để kiểm tra xem task đó đã hoàn thành trọn vẹn chưa.
5.  **📚 Tài Liệu Tham Khảo:** Các bài viết, link thư viện cần đọc.
