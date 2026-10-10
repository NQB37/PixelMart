# Sprint 7 — Admin orders & Release · v1.0.0 · 8 pts · *draft*

**Sprint Goal:** Khép kín vòng e-commerce (admin xác nhận đơn); hệ thống được harden và phát hành **v1.0.0**.

**Học được:** state transition, security hardening, performance/a11y, viết tài liệu, release lớn.

> Giữ ~1–2 pts dự phòng cho việc trễ từ các sprint trước.

---

### PXM-40 · Admin xem & xác nhận đơn
`Story` · Checkout & Orders · **2 pts** · `api` `admin`

> Là admin, tôi muốn xác nhận đơn hàng mới.

- `GET /v1/admin/orders` (phân trang, lọc status); `PATCH /v1/admin/orders/:id/confirm`
- Bảng đơn hàng + nút Confirm

**AC**
- [ ] Chỉ `PENDING → CONFIRMED`; xác nhận lại → 409
- [ ] Khách thấy trạng thái mới trong "Đơn hàng của tôi"

### PXM-41 · Security hardening
`Task` · Release v1.0 · **2 pts** · `security`

- `helmet`, rà soát rate limit, CORS, cookie; `pnpm audit`; chạy `/security-review` toàn repo

**AC**
- [ ] Không còn vấn đề mức High chưa xử lý
- [ ] Security headers đạt kiểm tra (securityheaders.com ≥ A)

### PXM-42 · UX polish storefront
`Task` · Release v1.0 · **2 pts** · `web`

- `error.tsx`, `not-found.tsx`, trạng thái loading/empty nhất quán; a11y cơ bản

**AC**
- [ ] Lighthouse trang chi tiết sản phẩm: Performance & Accessibility ≥ 90

### PXM-43 · Tài liệu & demo
`Task` · Release v1.0 · **1 pt** · `docs`

- README: sơ đồ kiến trúc, chạy local, bảng biến env, link OpenAPI; video demo 3–5 phút

**AC**
- [ ] Người lạ clone repo chạy được local chỉ bằng README

### PXM-44 · Release v1.0.0 & retro tổng
`Task` · Release v1.0 · **1 pt** · `devops`

- Release theo checklist; retro toàn bộ v1; lập backlog v1.1 (mobile)

**AC**
- [ ] Tag `v1.0.0`, GitHub Release có changelog đầy đủ
- [ ] `docs/retro/v1.md` + Epic v1.1 trên Jira
