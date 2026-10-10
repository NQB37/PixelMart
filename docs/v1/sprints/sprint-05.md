# Sprint 5 — Admin catalog UI & Storefront browsing · v0.5.0 · 10 pts · *draft*

**Sprint Goal:** Admin quản lý category/product trên `admin.<domain>`; khách duyệt landing, danh sách và chi tiết sản phẩm.

**Học được:** TanStack Table server-side pagination, mutation + invalidate cache, RSC data fetching, ISR, SEO metadata.

---

### PXM-31 · Admin quản lý category
`Story` · Catalog · **2 pts** · `admin`

- Bảng danh sách; dialog tạo/sửa; xác nhận xóa

**AC**
- [ ] Tạo/sửa/xóa cập nhật bảng ngay (invalidate query)
- [ ] Lỗi 409 hiển thị thông báo dễ hiểu

### PXM-32 · Admin quản lý product
`Story` · Catalog · **3 pts** · `admin`

- TanStack Table phân trang phía server, lọc theo category
- Form: nhập giá dạng `199.00` → chuyển thành `priceMinor`; preview ảnh từ URL

**AC**
- [ ] Đổi trang/lọc phản ánh trên URL (reload giữ trạng thái)
- [ ] Giá hiển thị đúng định dạng tiền tệ, không lỗi làm tròn

### PXM-33 · Public catalog API
`Story` · Storefront & Cart · **1 pt** · `api`

- `GET /v1/products?category=&page=&pageSize=`, `GET /v1/products/:slug`, `GET /v1/products?ids=` (dùng cho giỏ hàng)

**AC**
- [ ] Slug không tồn tại → 404
- [ ] `pageSize` tối đa 50

### PXM-34 · Landing & danh sách sản phẩm
`Story` · Storefront & Cart · **2 pts** · `web`

> Là khách, tôi muốn duyệt sản phẩm theo danh mục.

- Landing (hero + sản phẩm mới); `/categories/[slug]` + phân trang qua `searchParams`
- `loading.tsx`, empty state

**AC**
- [ ] Trang render phía server (xem source có HTML sản phẩm)
- [ ] Category rỗng hiển thị empty state

### PXM-35 · Trang chi tiết sản phẩm
`Story` · Storefront & Cart · **2 pts** · `web`

- `/products/[slug]`, ISR `revalidate: 60`, `generateMetadata` (title, description, OG image)
- Chiến lược `next/image` cho URL ảnh tùy ý → ADR-0007

**AC**
- [ ] Sản phẩm không tồn tại → `not-found`
- [ ] Admin sửa giá → shop cập nhật trong ≤ 60 giây
