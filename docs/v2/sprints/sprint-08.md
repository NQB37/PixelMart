# Sprint 8 — Marketplace Foundation · v1.1.0 · 10 pts · *draft*

**Sprint Goal:** Một người dùng đăng ký mở shop, admin duyệt, và seller đăng nhập được vào `seller.<domain>`. API được chia thành các module có ranh giới được CI kiểm tra.

**Học được:** modular monolith và dependency rule, migration expand/contract trên dữ liệu thật, RBAC kết hợp ownership, workflow duyệt có trạng thái, dựng SPA thứ hai dùng lại pattern của admin.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S8-02 và S8-03 (migration trên dữ liệu production của v1). Làm trước, thử trên một Neon branch có dữ liệu thật trước khi merge.
- Thứ tự: S8-01 → S8-02 → S8-03 → S8-04 → S8-06 → S8-05.
- S8-01 đổi cấu trúc thư mục của API. Merge sớm để các ticket sau không bị conflict.

---

### S8-01 · Modular monolith: ranh giới module + kiểm tra trong CI
`Task` · Marketplace Foundation · **2 pts** · `api` `devops`

- Sắp xếp `apps/api/src` thành các module domain: `identity`, `stores`, `catalog`, `orders` (sau này thêm `ledger`). Mỗi module có một file public (`index.ts`) export những gì module khác được dùng.
- Luật phụ thuộc: module khác chỉ được import qua public file, không import sâu vào file nội bộ. Kiểm tra tự động bằng lint (ESLint rule hoặc công cụ kiểm tra dependency), chạy trong job `ci`.
- ADR-0008: Modular monolith và các ranh giới module.

**AC**
- [ ] Thêm một import sâu `orders → catalog/internal/...` → CI đỏ với thông báo chỉ rõ vi phạm
- [ ] Toàn bộ test v1 vẫn xanh sau khi sắp xếp lại
- [ ] ADR-0008 có sơ đồ module và danh sách phụ thuộc được phép

**Ngoài phạm vi:** tách database theo module (vẫn một schema Postgres). Tách process (v8).

### S8-02 · Role SELLER + chủ sở hữu và trạng thái của Store
`Task` · Marketplace Foundation · **2 pts** · `api` `db`

- Thêm `SELLER` vào enum role.
- `Store` thêm `ownerId` (→ User, unique: một user sở hữu tối đa một shop), `status` (`PENDING | ACTIVE | SUSPENDED | REJECTED`), `commissionRateBps`, `description`.
- Migration expand/contract: thêm cột nullable → backfill store "PixelMart" (owner tạm là admin), `status = ACTIVE`, `commissionRateBps = 0` → đặt `ownerId` NOT NULL.
- Seed tạo **tài khoản seller chính hãng** (email/mật khẩu từ env, idempotent) và chuyển quyền sở hữu store "PixelMart" sang tài khoản đó. Admin không sở hữu shop (ADR-0008).

**AC**
- [ ] Migration chạy được trên một bản sao DB có dữ liệu v1 (Neon branch), không mất sản phẩm/đơn nào
- [ ] Sau migration + seed: store "PixelMart" `ACTIVE`, chủ sở hữu là tài khoản seller chính hãng (role `SELLER`), mọi sản phẩm v1 vẫn hiển thị trên shop
- [ ] Không thể tạo hai Store cùng `ownerId` (constraint của DB)

### S8-03 · Category toàn sàn
`Task` · Marketplace Foundation · **1 pt** · `api` `db`

- Category chuyển từ "thuộc một store" sang **dùng chung toàn sàn**, chỉ admin quản lý. Slug unique toàn sàn.
- Expand/contract: field `storeId` trong response của category được giữ lại và đánh dấu deprecated (xóa ở S12-05).

**AC**
- [ ] Migration chạy được trên dữ liệu v1, slug không bị trùng sau khi gộp
- [ ] API category cũ vẫn trả đúng cấu trúc (không phá vỡ client v1)
- [ ] OpenAPI đánh dấu `storeId` là deprecated

### S8-04 · Đăng ký mở shop
`Story` · Marketplace Foundation · **2 pts** · `api` `contracts`

> Là khách hàng đã có tài khoản, tôi muốn đăng ký mở shop để bán hàng trên PixelMart.

- `POST /v1/seller/applications` (đăng nhập bắt buộc): tạo Store `PENDING` với tên, slug, mô tả.
- `GET /v1/seller/store`: xem shop của mình và trạng thái duyệt.
- Admin: `GET /v1/admin/stores?status=`, `PATCH /v1/admin/stores/:id/approve`, `PATCH /v1/admin/stores/:id/reject` (kèm lý do).
- Duyệt: Store `PENDING → ACTIVE` **và** user `CUSTOMER → SELLER` trong cùng một transaction. Từ chối: `PENDING → REJECTED`, user được nộp lại.
- Lưu kết quả duyệt: `rejectionReason`, `reviewedAt`, `reviewedBy` (migration riêng). Tài khoản `ADMIN` không được mở shop.

**AC**
- [ ] Đã có shop `PENDING`/`ACTIVE` mà nộp đơn lần nữa → 409
- [ ] Duyệt shop không ở trạng thái `PENDING` → 409. Hai admin duyệt cùng lúc → đúng một thành công
- [ ] Sau khi duyệt, đăng nhập lại → access token có role `SELLER`
- [ ] Endpoint admin: 401/403 được test. Khách không xem được đơn đăng ký của người khác
- [ ] Tài khoản `ADMIN` nộp đơn → 403. Duyệt chỉ đổi role khi chủ đơn đang là `CUSTOMER`

**Ngoài phạm vi:** upload giấy tờ, xác minh danh tính, email thông báo (v5).

### S8-05 · Seller app skeleton + deploy + route guard
`Task` · Marketplace Foundation · **2 pts** · `seller` `devops`

- `apps/seller`: Vite + React + TanStack Router/Query + Tailwind + shadcn, cùng cấu trúc với `apps/admin`. Cân nhắc tách phần dùng chung (layout, api hooks, form) sang một package UI nội bộ.
- Route guard: yêu cầu role `SELLER` và shop `ACTIVE`. Nếu đơn đang `PENDING`/`REJECTED` thì hiển thị trang trạng thái tương ứng.
- Vercel project thứ ba → `seller.<domain>`. Thêm origin vào `CORS_ORIGINS`.

**AC**
- [ ] `seller.<domain>` online. Reload route con không 404
- [ ] Khách chưa có shop → trang "Đăng ký mở shop" (link tới form của S8-04)
- [ ] Shop `PENDING` → trang "Đang chờ duyệt". Seller `ACTIVE` → vào dashboard

### S8-06 · Admin duyệt shop
`Story` · Marketplace Foundation · **1 pt** · `admin`

> Là admin sàn, tôi muốn duyệt hoặc từ chối đơn mở shop.

- Trang `/stores` trong admin: bảng lọc theo trạng thái, nút Duyệt/Từ chối (từ chối yêu cầu nhập lý do).

**AC**
- [ ] Duyệt → shop biến khỏi danh sách `PENDING`, seller vào được `seller.<domain>`
- [ ] Lỗi 409 (đã được duyệt bởi người khác) hiển thị thông báo dễ hiểu
