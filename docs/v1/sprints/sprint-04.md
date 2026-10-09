# Sprint 4 — Auth UI & Catalog API · v0.4.0 · 10 pts · *draft*

**Sprint Goal:** Khách đăng ký/đăng nhập được trên shop, admin đăng nhập vào admin; API quản lý category/product sẵn sàng.

**Học được:** form dùng chung Zod schema, auth state trong RSC & SPA, silent refresh, CRUD phân tầng, slug, quy tắc FK khi xóa, phân trang.

---

### PXM-26 · Trang đăng ký / đăng nhập trên shop
`Story` · Identity & Auth · **2 pts** · `web`

> Là khách, tôi muốn đăng ký/đăng nhập ngay trên shop.

- Form React Hook Form + `zodResolver(registerSchema/loginSchema)` từ contracts
- Hỗ trợ `?redirect=`; header hiển thị tên + nút logout
- Middleware Next.js chặn route cần đăng nhập

**AC**
- [ ] Lỗi validation hiển thị giống hệt rule phía API (cùng schema)
- [ ] Đăng nhập xong quay về trang `redirect`
- [ ] Reload trang vẫn giữ trạng thái đăng nhập (SSR đọc cookie)

### PXM-27 · Silent refresh trong api-client
`Task` · Identity & Auth · **2 pts** · `contracts` `web` `admin`

- Nhận 401 → gọi `/v1/auth/refresh` **một lần** → retry request gốc
- Single-flight: nhiều request 401 cùng lúc chỉ gọi refresh 1 lần

**AC**
- [ ] Access token hết hạn → người dùng không nhận ra (không bị đá ra login)
- [ ] Refresh fail → chuyển về login
- [ ] Unit test cho single-flight

### PXM-28 · Admin login & route guard
`Story` · Identity & Auth · **1 pt** · `admin`

- Trang `/login`; `beforeLoad` gọi `/v1/me`, yêu cầu role `ADMIN`

**AC**
- [ ] Chưa đăng nhập → chuyển về `/login`
- [ ] Tài khoản CUSTOMER → trang "Không có quyền truy cập"

### PXM-29 · Category CRUD API
`Story` · Catalog · **2 pts** · `api`

> Là admin, tôi muốn quản lý danh mục để sắp xếp sản phẩm.

- Model `Category` (storeId, name, slug, parentId nullable — v1 chỉ 1 cấp)
- `GET/POST/PATCH/DELETE /v1/admin/categories`; `GET /v1/categories` (public)
- Slug tự sinh, unique theo store

**AC**
- [ ] Xóa category còn product → 409
- [ ] Tên trùng slug → slug tự thêm hậu tố (`ao-thun-2`)
- [ ] Endpoint admin: 401/403 được test

### PXM-30 · Product CRUD API
`Story` · Catalog · **3 pts** · `api`

> Là admin, tôi muốn tạo và chỉnh sửa sản phẩm.

- Model `Product` (`priceMinor` int, `currency`, `imageUrl` https, slug, categoryId FK `Restrict`)
- `GET/POST/PATCH/DELETE /v1/admin/products` — phân trang offset, lọc theo `categoryId`
- Xóa cứng

**AC**
- [ ] `priceMinor` âm hoặc thập phân → 400
- [ ] `imageUrl` không phải https → 400
- [ ] Response phân trang dạng `{ items, page, pageSize, total }`
