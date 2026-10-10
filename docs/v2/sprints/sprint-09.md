# Sprint 9 — Seller Catalog · v1.2.0 · 10 pts · *draft*

**Sprint Goal:** Seller đăng và quản lý sản phẩm, tồn kho của **chính shop mình**; khách duyệt sản phẩm của nhiều shop và xem trang từng shop. Admin có thể tạm khóa một shop.

**Học được:** chống BOLA bằng scoping theo chủ sở hữu, test ma trận phân quyền, trạng thái hiển thị nhiều tầng (shop × sản phẩm), tái sử dụng UI ở lần thứ hai.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S9-01, vì mọi lỗ hổng phân quyền của seller bắt đầu từ đây. Viết test ma trận **trước** khi cài đặt.
- Thứ tự: S9-01 → S9-03 → S9-05 → S9-02 → S9-04.
- S9-02 là lần thứ hai làm bảng sản phẩm (lần đầu ở PXM-32), nên theo rule 05 có thể giao Claude dựng khung UI, bạn review.

---

### S9-01 · API sản phẩm của seller (scoped theo shop)
`Story` · Seller Catalog · **3 pts** · `api` `contracts` `security`

> Là seller, tôi muốn tạo và sửa sản phẩm của shop mình.

- `GET/POST/PATCH/DELETE /v1/seller/products`: shop được xác định từ **người đang đăng nhập**, không bao giờ lấy `storeId` từ body hay query.
- Product thêm `stock` (int ≥ 0) và `status` (`DRAFT | ACTIVE | ARCHIVED`). Sản phẩm mới mặc định `DRAFT`.
- Xóa sản phẩm đã từng có đơn bị DB chặn (FK `OrderItem.productId` đổi sang `onDelete: Restrict`) → 409, gợi ý chuyển `ARCHIVED`.
- Endpoint admin sản phẩm của v1 vẫn hoạt động cho admin (trên mọi shop), contract và form admin **thêm `status`, `stock`**.

**AC**
- [ ] Seller A sửa/xóa/xem sản phẩm của seller B → **404**
- [ ] Gửi `storeId` của shop khác trong body → bị bỏ qua, sản phẩm vẫn thuộc shop của người gửi
- [ ] Shop không `ACTIVE` (PENDING/SUSPENDED) → không tạo/sửa được sản phẩm (403 kèm lý do)
- [ ] `stock` âm hoặc không phải số nguyên → 400
- [ ] Test ma trận: khách / seller khác shop / seller đúng shop / admin cho mọi endpoint

### S9-02 · Seller UI quản lý sản phẩm
`Story` · Seller Catalog · **2 pts** · `seller`

> Là seller, tôi muốn quản lý sản phẩm, tồn kho và trạng thái hiển thị trên giao diện.

- Bảng sản phẩm phân trang server-side (dùng lại pattern PXM-32), lọc theo trạng thái.
- Form tạo/sửa: tên, mô tả, danh mục (danh mục toàn sàn), giá (dùng `parseMoneyInput`), ảnh URL, tồn kho, trạng thái.
- Hành động nhanh: "Đăng bán" (`DRAFT → ACTIVE`), "Ngừng bán" (`ACTIVE → ARCHIVED`).

**AC**
- [ ] Seller chỉ thấy sản phẩm của shop mình
- [ ] Đổi trạng thái → bảng cập nhật ngay. Sản phẩm `ACTIVE` xuất hiện trên storefront
- [ ] Tồn kho 0 → hiển thị nhãn "Hết hàng"

### S9-03 · Public catalog đa shop
`Story` · Seller Catalog · **2 pts** · `api`

- Public API chỉ trả sản phẩm `ACTIVE` của shop `ACTIVE`.
- Response sản phẩm thêm `shop: { name, slug }` và `inStock` (boolean, không lộ con số tồn kho chính xác).
- `GET /v1/shops/:slug`: thông tin shop + sản phẩm của shop (phân trang). Endpoint nằm ở module `catalog` (đúng chiều phụ thuộc).
- Checkout hiện tại (PXM-37) dùng chung quy tắc hiển thị: sản phẩm không hiển thị công khai → 422.
- `GET /v1/products?shop=<slug>` để lọc theo shop.

**AC**
- [ ] Sản phẩm `DRAFT`/`ARCHIVED` hoặc thuộc shop `SUSPENDED` → không xuất hiện trong danh sách, chi tiết trả 404
- [ ] Shop `PENDING`/`SUSPENDED`/`REJECTED` → `GET /v1/shops/:slug` trả 404
- [ ] Response public không có `stock`, `commissionRateBps`, `ownerId`
- [ ] Checkout với sản phẩm `DRAFT`/`ARCHIVED` hoặc của shop `SUSPENDED` → 422

### S9-04 · Trang shop & thông tin shop trên storefront
`Story` · Seller Catalog · **2 pts** · `web`

> Là khách, tôi muốn xem một shop và các sản phẩm của shop đó.

- `/shops/[slug]`: header shop (tên, mô tả), lưới sản phẩm, phân trang (SSR như PXM-34).
- Trang chi tiết sản phẩm hiển thị tên shop có link sang trang shop, và nhãn "Hết hàng" khi `inStock = false` (nút thêm vào giỏ bị vô hiệu).

**AC**
- [ ] View source `/shops/[slug]` có HTML sản phẩm
- [ ] Shop không tồn tại hoặc bị khóa → trang 404
- [ ] Sản phẩm hết hàng không thêm vào giỏ được

### S9-05 · Admin tạm khóa / mở khóa shop
`Story` · Seller Catalog · **1 pt** · `api` `admin`

> Là admin sàn, tôi muốn tạm khóa shop vi phạm.

- `PATCH /v1/admin/stores/:id/suspend` (kèm lý do), `PATCH /v1/admin/stores/:id/reactivate`.
- Shop bị khóa: sản phẩm biến khỏi storefront, seller vẫn đăng nhập được nhưng thấy banner lý do và không sửa được sản phẩm.

**AC**
- [ ] Khóa shop → mọi sản phẩm của shop biến khỏi public API ngay lập tức
- [ ] Mở khóa → sản phẩm `ACTIVE` hiển thị lại
- [ ] Chỉ chuyển trạng thái hợp lệ (`ACTIVE ↔ SUSPENDED`), còn lại → 409

**Ngoài phạm vi:** xử lý đơn đang dở của shop bị khóa (v2 vẫn cho seller xử lý tiếp đơn đã có).

> **Khoảng trống được chấp nhận (v1.2.0 → v1.3.0):** checkout chưa trừ và chưa kiểm tra tồn kho cho tới S10-03. Trong một sprint, khách gọi thẳng API vẫn có thể đặt sản phẩm `stock = 0`. Seller chỉnh tồn kho thủ công nếu cần.
