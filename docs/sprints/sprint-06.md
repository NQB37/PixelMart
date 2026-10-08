# Sprint 6 — Cart & Checkout · v0.6.0 · 9 pts · *draft*

**Sprint Goal:** Khách thêm vào giỏ và đặt hàng thành công; đơn được tạo với giá do **server** tính.

**Học được:** client state persist & hydration, transaction, snapshot dữ liệu, Ports & Adapters, idempotency, chống IDOR.

---

### PXM-36 · Giỏ hàng phía client
`Story` · Storefront & Cart · **2 pts** · `web`

> Là khách, tôi muốn thêm sản phẩm vào giỏ mà chưa cần đăng nhập.

- Zustand `persist` (localStorage): thêm, đổi số lượng, xóa; badge trên header; trang `/cart`
- Trang cart gọi `GET /v1/products?ids=` để lấy giá/tên mới nhất

**AC**
- [ ] Reload trang giỏ hàng vẫn còn, không lỗi hydration
- [ ] Sản phẩm đã bị xóa → tự loại khỏi giỏ kèm thông báo

### PXM-37 · API tạo đơn hàng
`Story` · Checkout & Orders · **3 pts** · `api`

- Model `Order` (status `PENDING|CONFIRMED`, totalMinor, idempotencyKey unique), `OrderItem` (snapshot `productName`, `unitPriceMinor`; `productId` `SetNull`)
- `POST /v1/orders` nhận `[{ productId, quantity }]` + header `Idempotency-Key`
- Tính lại giá từ DB, tạo trong `$transaction`, gọi `PaymentProvider` (`FakePaymentProvider`)

**AC**
- [ ] Client gửi kèm giá giả mạo → bị bỏ qua, tổng tính từ DB
- [ ] Product không tồn tại → 422
- [ ] Cùng `Idempotency-Key` gửi 2 lần → trả cùng một order, DB chỉ có 1 bản ghi
- [ ] Xóa product sau khi mua → đơn cũ vẫn hiển thị tên & giá

### PXM-38 · Trang checkout
`Story` · Checkout & Orders · **2 pts** · `web`

> Là khách, tôi muốn xác nhận giỏ hàng và đặt hàng.

- Chưa đăng nhập → login → quay lại checkout
- Sinh `Idempotency-Key` cho mỗi lần đặt; trang thành công; xóa giỏ

**AC**
- [ ] Bấm "Đặt hàng" 2 lần liên tiếp chỉ tạo 1 đơn
- [ ] Lỗi API hiển thị thông báo, giỏ hàng được giữ nguyên

### PXM-39 · Đơn hàng của tôi
`Story` · Checkout & Orders · **2 pts** · `api` `web`

- `GET /v1/orders`, `GET /v1/orders/:id` (chỉ đơn của chính mình)
- Trang `/account/orders` và chi tiết

**AC**
- [ ] User A xem đơn của user B → **404** (không phải 403, để không lộ đơn tồn tại)
- [ ] Danh sách sắp xếp mới nhất trước
