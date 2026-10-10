# Sprint 10 — Multi-vendor Checkout · v1.3.0 · 10 pts · *draft*

**Sprint Goal:** Khách thanh toán một giỏ có hàng của nhiều shop **một lần**; hệ thống tách thành đơn riêng cho từng shop với phí ship và hoa hồng đúng, và **không bao giờ bán quá tồn kho**.

**Học được:** aggregate root và invariant, chia tiền có quy tắc làm tròn, migration dữ liệu đơn hàng thật, chống oversell bằng update có điều kiện, test đồng thời.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S10-02 + S10-03 (tiền và tồn kho trong cùng một transaction). Viết test đồng thời ngay từ đầu.
- Thứ tự: S10-01 → S10-02 → S10-03 → S10-04 → S10-05.
- S10-01 đổi cấu trúc đơn hàng v1. API response chỉ được **thêm** field (quy ước không phá vỡ API trong một version).

---

### S10-01 · Schema Order → VendorOrder + migration đơn v1
`Task` · Multi-vendor Checkout · **2 pts** · `api` `db`

- `Order`: đơn của khách (userId, totalMinor, idempotencyKey, trạng thái thanh toán).
- `VendorOrder`: một đơn con cho mỗi shop (orderId, storeId, status, subtotalMinor, shippingFeeMinor, commissionRateBps, commissionMinor, sellerNetMinor).
- `OrderItem` chuyển sang thuộc `VendorOrder` (vẫn snapshot tên + giá).
- Migration: mỗi đơn v1 → một VendorOrder của shop "PixelMart", trạng thái giữ nguyên, hoa hồng 0.

**AC**
- [ ] Migration chạy được trên bản sao dữ liệu v1. Số đơn, số item, tổng tiền trước và sau khớp nhau (có script kiểm tra)
- [ ] `GET /v1/orders/:id` vẫn trả đủ field cũ, có thêm `vendorOrders[]`
- [ ] Trang "Đơn hàng của tôi" của v1 vẫn hoạt động
- [ ] `vendorOrders[]` trong response của khách **không** có `commissionRateBps`, `commissionMinor`, `sellerNetMinor`
- [ ] Admin xác nhận đơn (PXM-40) cập nhật cả Order và VendorOrder trong cùng transaction

### S10-02 · Checkout tách đơn theo shop
`Story` · Multi-vendor Checkout · **3 pts** · `api` `contracts`

> Là khách, tôi muốn thanh toán giỏ hàng có sản phẩm của nhiều shop trong một lần.

- `POST /v1/orders` (giữ nguyên contract request + `Idempotency-Key`): nhóm item theo shop → mỗi shop một VendorOrder.
- Mỗi VendorOrder: `subtotal` (từ giá DB), `shippingFee` cố định (cấu hình), `commission = floor(subtotal × rateBps / 10000)` với `rateBps` **snapshot** từ shop lúc đặt, `sellerNet = subtotal + shippingFee − commission`.
- `Order.total = Σ (subtotal + shippingFee)` của các VendorOrder. Gọi `PaymentProvider` **một lần** cho tổng.
- Shop không `ACTIVE` hoặc sản phẩm không `ACTIVE` → 422 kèm danh sách sản phẩm lỗi.

**AC**
- [ ] Giỏ có 3 sản phẩm của 2 shop → 1 Order, 2 VendorOrder, tổng khớp từng thành phần
- [ ] Đổi `commissionRateBps` của shop sau khi đặt → hoa hồng của đơn cũ không đổi
- [ ] Bảng test làm tròn: subtotal 999, rate 1000 bps → commission 99, sellerNet = 900 + ship
- [ ] Invariant (test): `Σ sellerNet + Σ commission = Order.total`
- [ ] Idempotency v1 vẫn đúng (cùng key → cùng Order, kể cả khi gửi đồng thời)

### S10-03 · Trừ tồn kho atomic, không oversell
`Story` · Multi-vendor Checkout · **2 pts** · `api`

> Là seller, tôi muốn hệ thống không bao giờ bán nhiều hơn số hàng tôi có.

- Trong cùng transaction tạo đơn: với mỗi item, trừ kho bằng **update có điều kiện** (`stock >= quantity`). Một item không đủ → rollback toàn bộ đơn → 409 kèm danh sách sản phẩm không đủ hàng.
- Thứ tự cập nhật các sản phẩm phải nhất quán (ví dụ theo `productId`) để tránh deadlock.

**AC**
- [ ] Test đồng thời: `stock = 1`, hai khách đặt cùng lúc → đúng 1 đơn thành công, 1 nhận 409, `stock` cuối = 0
- [ ] Đơn có 2 item, item thứ hai thiếu hàng → không item nào bị trừ kho, không có Order nào được tạo
- [ ] Gửi lại cùng `Idempotency-Key` → không trừ kho lần hai
- [ ] `stock = 1`, hai request đồng thời **cùng** `Idempotency-Key` → cả hai nhận cùng một order (không có 409 "hết hàng")

**Ngoài phạm vi:** giữ hàng (reservation) khi đang ở trang checkout, flash sale (v4 với Redis).

### S10-04 · Giỏ hàng nhóm theo shop + checkout UI
`Story` · Multi-vendor Checkout · **2 pts** · `web`

> Là khách, tôi muốn thấy giỏ hàng chia theo từng shop với phí ship của mỗi shop.

- Trang giỏ và checkout nhóm sản phẩm theo shop: tạm tính từng shop, phí ship từng shop, tổng cuối.
- Hiển thị lỗi từng sản phẩm khi API trả 409 (hết hàng) hoặc 422 (ngừng bán), cho phép bỏ sản phẩm đó rồi đặt lại.
- Store giỏ hàng tăng `version` của persist và migrate dữ liệu giỏ cũ.

**AC**
- [ ] Giỏ 2 shop → 2 nhóm, mỗi nhóm có phí ship, tổng khớp với API
- [ ] Một sản phẩm vừa hết hàng → thông báo đúng sản phẩm, các sản phẩm khác giữ nguyên
- [ ] Khách có giỏ từ v1 (localStorage cũ) → giỏ vẫn hiển thị đúng sau khi lên v2

### S10-05 · Đơn hàng của tôi (multi-vendor)
`Story` · Multi-vendor Checkout · **1 pt** · `web`

- Chi tiết đơn hiển thị từng VendorOrder: tên shop, sản phẩm, phí ship, trạng thái riêng.
- Danh sách đơn hiển thị số shop và trạng thái tổng hợp.

**AC**
- [ ] Đơn 2 shop hiển thị 2 khối, mỗi khối một trạng thái
- [ ] Vẫn chỉ xem được đơn của chính mình (test IDOR của v1 vẫn xanh)
