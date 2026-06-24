# 📐 Design Spec: Frontend Restructuring (Web & Mobile Split)

**Dự án:** PixelMart — Multi-Vendor Marketplace  
**Ngày:** 2026-06-22  
**Trạng thái:** Đã phê duyệt bởi Khách hàng

---

## 1. Bối Cảnh & Mục Tiêu

Hiện tại, cấu trúc Frontend (`/client`) đang là một Next.js Monolith duy nhất chứa tất cả các luồng giao diện cho Khách hàng (Buyer), Người bán (Seller) và Quản trị viên (Admin) thông qua Route Groups.

Để chuẩn bị cho việc mở rộng lâu dài và tách biệt vai trò phát triển:

- **Tách biệt ứng dụng Web:**
  - `client-web`: Next.js (Dành cho Buyer - cần SSR tối ưu SEO).
  - `seller-web`: React + Vite SPA (Kênh người bán - thao tác realtime, không cần SEO).
  - `admin-web`: React + Vite SPA (Trang quản trị hệ thống - không cần SEO).
- **Tách biệt ứng dụng Mobile:**
  - `client-mobile`: React Native + Expo (Ứng dụng mua sắm cho khách hàng).
  - `delivery-mobile`: React Native + Expo (Ứng dụng cho shipper/giao hàng).
- **Chia sẻ mã nguồn hiệu quả (DRY):** Thiết lập các gói `shared` riêng cho không gian Web và Mobile độc lập để tái sử dụng component và logic nghiệp vụ.

---

## 2. Kiến Trúc Thư Mục Mới (Directory Structure)

Thư mục gốc sẽ được phân tách lại như sau:

```
PixelMart/
├── server/                      # [Backend] Express.js Monolith (Prisma ORM)
│
├── web/                         # 🌐 [Web Space] - Workspace cho các dự án Web
│   ├── pnpm-workspace.yaml      # Cấu hình pnpm workspace riêng cho Web
│   ├── shared/                  # 📦 Thư mục chứa components, styles, services dùng chung cho Web
│   │   ├── package.json         # Package metadata (@pixelmart/shared-web)
│   │   ├── src/
│   │   │   ├── index.ts         # Entry point export các component & hooks
│   │   │   ├── components/      # UI components dùng chung (shadcn/ui + Tailwind v4)
│   │   │   ├── hooks/           # Custom React hooks (useAuth, useCart...)
│   │   │   └── utils/           # Axios client, helpers, Zod validation schemas
│   ├── client-web/              # Next.js 15+ App Router (Port 3000)
│   ├── seller-web/              # React + Vite + TypeScript (Port 3001)
│   └── admin-web/               # React + Vite + TypeScript (Port 3002)
│
├── mobile/                      # 📱 [Mobile Space] - Workspace cho các ứng dụng Expo
│   ├── pnpm-workspace.yaml      # Cấu hình pnpm workspace riêng cho Mobile
│   ├── shared/                  # 📦 Thư mục chứa components, hooks dùng chung cho Mobile
│   │   ├── package.json         # Package metadata (@pixelmart/shared-mobile)
│   │   └── src/                 # Code chia sẻ (React Native components)
│   ├── client-mobile/           # React Native / Expo (Buyer App)
│   └── delivery-mobile/         # React Native / Expo (Delivery App)
│
└── docs/                        # Tài liệu dự án
    └── plan/                    # Các file lộ trình chi tiết
```

---

## 3. Quản Lý Dependency & Gói Dùng Chung (Workspace cục bộ)

Chúng ta chọn phương án **Local Workspace với pnpm** cho từng nhóm (Web và Mobile độc lập) để tránh sự phức tạp của một Monorepo toàn bộ nhưng vẫn giữ khả năng liên kết hoàn hảo.

### 3.1 Cấu hình Web Workspace (`web/pnpm-workspace.yaml`)

```yaml
packages:
  - "shared"
  - "client-web"
  - "seller-web"
  - "admin-web"
```

### 3.2 Khai báo sử dụng trong các App con

Trong `package.json` của `client-web`, `seller-web`, và `admin-web`, thêm dependency tham chiếu tới package shared:

```json
"dependencies": {
  "@pixelmart/shared-web": "workspace:*"
}
```

### 3.3 Chia sẻ UI Components & Tailwind CSS v4

Các component cơ bản của `shadcn/ui` sẽ được kéo vào `web/shared/src/components/ui/`.  
Để các class của Tailwind CSS hoạt động đúng khi import components từ `shared`:
Trong file CSS chính của các dự án con (ví dụ: `web/client-web/app/globals.css` hoặc `web/seller-web/src/index.css`), cấu hình thêm nguồn quét mã:

```css
@import "tailwindcss";
@source "../shared/src"; /* Quét qua mã nguồn shared để compile CSS */
```

---

## 4. Xác Thực (Authentication) & API Client

### 4.1 Axios Client dùng chung (`web/shared/src/utils/api.ts`)

Tạo một Axios instance duy nhất để các trang web con cùng sử dụng:

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL,
  withCredentials: true, // Cho phép tự động gửi HttpOnly Cookie chứa JWT token
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 4.2 Chia sẻ Cookie qua Subdomain

Để người dùng chuyển đổi mượt mà giữa các trang web mà không mất session:

- **Development:** Cấu hình các dự án chạy trên các cổng khác nhau trên `localhost` (`localhost:3000`, `localhost:3001`, `localhost:3002`). Trình duyệt tự động cho phép chia sẻ cookie nếu `withCredentials` là `true` và Backend CORS cho phép credentials.
- **Production:** Cấu hình domain chung. Ví dụ:
  - Buyer: `pixelmart.vn`
  - Seller: `seller.pixelmart.vn`
  - Admin: `admin.pixelmart.vn`
  - API: `api.pixelmart.vn`
  - Cookie của JWT Token trả về từ backend sẽ được cấu hình thuộc tính `Domain=.pixelmart.vn` để dùng chung cho tất cả subdomain.

---

## 5. Kế Hoạch Di Chuyển (Migration Steps)

1. **Đổi tên:** Đổi tên thư mục `client/` thành `web/`.
2. **Khởi tạo Shared Web:** Tạo thư mục `web/shared/`, thiết lập `package.json` và cấu hình TypeScript.
3. **Cấu hình Workspace:** Tạo file `web/pnpm-workspace.yaml`.
4. **Chia nhỏ Web Apps:**
   - Dịch chuyển Next.js app hiện tại thành `web/client-web/`.
   - Khởi tạo 2 dự án React + Vite mới: `web/seller-web/` và `web/admin-web/`.
   - Di chuyển các route group tương ứng (`(seller)` và `(admin)`) từ Next.js sang dự án Vite tương ứng.
5. **Cấu hình Mobile:** Tạo thư mục `mobile/`, cấu hình `mobile/pnpm-workspace.yaml`, và tạo placeholder cho `mobile/shared`, `mobile/client-mobile`, `mobile/delivery-mobile`.
6. **Cập nhật Lộ trình:** Sửa đổi các tài liệu plan trong `docs/plan/` để phản ánh đúng cấu trúc và thứ tự triển khai mới.
