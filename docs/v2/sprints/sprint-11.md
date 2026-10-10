# Sprint 11 — Fulfillment & Ledger · v1.4.0 · 10 pts · *draft*

**Sprint Goal:** Seller xử lý đơn của shop mình tới khi khách xác nhận đã nhận hàng; mọi khoản tiền phát sinh khi thanh toán được ghi vào **sổ cái kép** cân bằng.

**Học được:** state machine nhiều tác nhân, trạng thái tổng hợp (derived state), double-entry ledger, bút toán idempotent, invariant tài chính.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S11-04 (thiết kế ledger). Sai thiết kế ở đây thì S12 làm lại toàn bộ. Chốt thiết kế bằng ADR trước khi code.
- Thứ tự: S11-01 → S11-03 → S11-02 → S11-04 → S11-05.

---

### S11-01 · State machine VendorOrder
`Story` · Fulfillment · **2 pts** · `api`

> Là seller, tôi muốn xác nhận và giao các đơn của shop mình.

- Trạng thái: `PENDING → CONFIRMED → SHIPPED → DELIVERED`. Seller được chuyển `PENDING→CONFIRMED` và `CONFIRMED→SHIPPED`. Khách được chuyển `SHIPPED→DELIVERED`.
- `GET /v1/seller/orders?status=` (chỉ VendorOrder của shop mình, thuộc Order đã `PAID`), `PATCH /v1/seller/orders/:id/confirm`, `PATCH /v1/seller/orders/:id/ship`.
- Trạng thái tổng hợp của `Order` nằm ở field **mới** `fulfillmentStatus`, được **tính** từ `paymentStatus` và các VendorOrder (ví dụ "Chờ thanh toán", "Đang xử lý", "Đã giao một phần", "Hoàn tất"). Field `status` cũ giữ nguyên tập giá trị v1 (deprecated, xóa ở S12-05).
- Mọi chuyển trạng thái dùng update có điều kiện (như PXM-40).

**AC**
- [ ] Seller A chuyển trạng thái đơn của shop B → 404
- [ ] Chuyển sai thứ tự (`PENDING → SHIPPED`) → 409
- [ ] Đơn 2 shop, một shop đã giao, một shop chưa → trạng thái tổng hợp đúng
- [ ] Hai request `confirm` đồng thời → một 200, một 409

### S11-02 · Seller UI xử lý đơn
`Story` · Fulfillment · **2 pts** · `seller`

- Trang `/orders`: bảng VendorOrder lọc theo trạng thái, chi tiết đơn (sản phẩm, địa chỉ placeholder, số tiền seller nhận), nút hành động theo trạng thái hiện tại.

**AC**
- [ ] Chỉ hiện nút hợp lệ cho trạng thái hiện tại
- [ ] Lỗi 409 (đã được chuyển ở tab khác) → thông báo + tải lại dữ liệu

### S11-03 · Khách xác nhận đã nhận hàng
`Story` · Fulfillment · **1 pt** · `api` `web`

> Là khách, tôi muốn xác nhận đã nhận hàng của từng shop.

- `PATCH /v1/orders/:orderId/vendor-orders/:id/received` (chỉ chủ đơn, chỉ khi `SHIPPED`).
- Nút "Đã nhận hàng" trên từng khối shop trong chi tiết đơn.

**AC**
- [ ] Khách khác gọi → 404. Đơn chưa `SHIPPED` → 409
- [ ] Sau khi xác nhận, seller thấy đơn ở trạng thái `DELIVERED`

### S11-04 · Ledger: schema + dịch vụ ghi bút toán
`Task` · Ledger & Payout · **3 pts** · `api` `db`

- Module `ledger`. `LedgerAccount` (loại: `PLATFORM_CLEARING`, `PLATFORM_REVENUE`, `SELLER_PENDING`, `SELLER_AVAILABLE`, `PAYOUT_CLEARING`; tài khoản seller gắn với `storeId`).
- `LedgerTransaction` (mô tả, `sourceType` + `sourceId` + `kind` unique để **ghi idempotent**) gồm nhiều `LedgerEntry` (accountId, số tiền có dấu hoặc cặp debit/credit).
- Dịch vụ `post(transaction)`: từ chối nếu tổng các entry ≠ 0. **Append-only**: không update, không delete entry. Sửa sai bằng bút toán đảo.
- ADR-0009: thiết kế ledger (quy ước dấu, danh sách tài khoản, idempotency).

**AC**
- [ ] Ghi một transaction không cân bằng → bị từ chối, không có entry nào được lưu
- [ ] Ghi lại cùng `sourceType + sourceId + kind` → không tạo bút toán trùng
- [ ] Không có API hay đường code nào update/delete `LedgerEntry` (kiểm tra bằng test + review)
- [ ] Số dư một tài khoản = tổng các entry của nó (hàm tính số dư có test)

### S11-05 · Bút toán khi thanh toán thành công
`Story` · Ledger & Payout · **2 pts** · `api`

> Là sàn, tôi muốn mọi đồng tiền khách trả đều được ghi nhận vào đúng tài khoản.

- Thứ tự sự kiện: (1) transaction tạo Order với `paymentStatus = UNPAID` (S10) → (2) commit → (3) `PaymentProvider.charge` → (4) charge thành công: **một transaction DB mới** gồm `paymentStatus: UNPAID → PAID` (update có điều kiện) **và** một LedgerTransaction (source = Order, loại `PAYMENT_CAPTURED`): tiền vào `PLATFORM_CLEARING` (= Order.total), với mỗi VendorOrder ghi `SELLER_PENDING` của shop (= sellerNet) và `PLATFORM_REVENUE` (= commission).
- **Không** ghi bút toán thanh toán trong transaction tạo đơn: lúc đó tiền chưa thu được. Bút toán phản ánh sự kiện **đã xảy ra**.
- Charge thất bại → `paymentStatus = FAILED`, không có bút toán. (Hoàn tồn kho cho đơn thất bại và cơ chế bù khi process chết giữa bước 3 và 4 (outbox) thuộc v5. Ghi rõ trong ADR-0009.)
- Seller chỉ thấy VendorOrder của Order đã `PAID` (S11-01).
- Migration/backfill: đơn v1 đã thanh toán → bút toán tương ứng (hoa hồng 0).

**AC**
- [ ] Đơn 2 shop → 1 transaction, các entry cân bằng, khớp `sellerNet`/`commission` của từng VendorOrder
- [ ] Retry tạo đơn (cùng Idempotency-Key) → không ghi bút toán lần hai
- [ ] Charge thất bại (Fake provider cấu hình lỗi) → `paymentStatus = FAILED`, không có bút toán, seller không thấy đơn
- [ ] Test invariant toàn hệ thống: tổng mọi entry = 0 sau một loạt đơn ngẫu nhiên
