# Sprint 12 — Payout & Release · v2.0.0 · 9 pts · *draft*

**Sprint Goal:** Seller thấy số dư và được sàn chi trả; báo cáo đối soát khớp tới từng đồng; xóa các API deprecated và phát hành **v2.0.0**.

**Học được:** chuyển trạng thái tiền theo sự kiện nghiệp vụ, tính số dư từ bút toán, thao tác tiền idempotent, đối soát (reconciliation), audit phân quyền, release major có breaking change.

> Giữ ~1 pt dự phòng cho việc trễ từ các sprint trước.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S12-03 (payout): tiền đi ra khỏi hệ thống, sai là mất tiền thật (nếu là tiền thật). Test đồng thời là bắt buộc.
- Thứ tự: S12-01 → S12-02 → S12-03 → S12-04 → S12-05 → S12-06.

---

### S12-01 · Chuyển tiền pending → available khi giao xong
`Story` · Ledger & Payout · **2 pts** · `api`

> Là seller, tôi muốn tiền của đơn đã giao thành công trở thành số dư rút được.

- Khi VendorOrder chuyển sang `DELIVERED` (S11-03): ghi LedgerTransaction (source = VendorOrder) chuyển `sellerNet` từ `SELLER_PENDING` sang `SELLER_AVAILABLE` của shop, **trong cùng transaction DB** với chuyển trạng thái.
- Backfill cho các VendorOrder đã `DELIVERED` trước khi tính năng này lên production.

**AC**
- [ ] Đơn chuyển `DELIVERED` → pending giảm, available tăng đúng `sellerNet`
- [ ] Chuyển trạng thái thất bại (409) → không có bút toán nào
- [ ] Gọi lặp → không ghi trùng (idempotent theo VendorOrder)

### S12-02 · Seller dashboard số dư & sao kê
`Story` · Ledger & Payout · **2 pts** · `api` `seller`

> Là seller, tôi muốn biết mình đang có bao nhiêu tiền và tiền đến từ đâu.

- `GET /v1/seller/balance`: số dư `pending` và `available` (tính từ ledger).
- `GET /v1/seller/statement?page=`: lịch sử bút toán của shop (thời gian, loại, đơn liên quan, số tiền, số dư sau giao dịch).
- Trang dashboard trong seller app.

**AC**
- [ ] Số dư khớp với tổng bút toán của shop (test so sánh với cách tính thủ công)
- [ ] Seller A không xem được số dư/sao kê của shop B
- [ ] Sao kê có phân trang, sắp xếp ổn định

### S12-03 · Admin chi trả cho seller (payout giả lập)
`Story` · Ledger & Payout · **2 pts** · `api` `admin`

> Là admin sàn, tôi muốn chi trả số dư khả dụng cho seller.

- `POST /v1/admin/stores/:id/payouts` (số tiền, `Idempotency-Key`): số tiền ≤ available → tạo `Payout` (`PAID` ngay, vì giả lập) + bút toán `SELLER_AVAILABLE → PAYOUT_CLEARING`.
- Trang trong admin: danh sách shop có số dư khả dụng, lịch sử payout. Seller thấy payout trong sao kê.

**AC**
- [ ] Payout lớn hơn available → 422, không có bút toán
- [ ] Hai payout đồng thời mà tổng vượt available → chỉ cái hợp lệ thành công, số dư không bao giờ âm
- [ ] Cùng `Idempotency-Key` → cùng một payout

**Ngoài phạm vi:** chuyển khoản ngân hàng thật, lịch payout tự động (v5 có job định kỳ).

### S12-04 · Đối soát (reconciliation)
`Task` · Ledger & Payout · **1 pt** · `api` `admin`

- `GET /v1/admin/reconciliation`: tổng mọi entry (phải = 0), với mỗi shop so sánh số dư ledger với số liệu tính từ đơn và payout (`Σ sellerNet của đơn đã DELIVERED − Σ payout = available`).
- Trang báo cáo trong admin. Lệch → hiển thị danh sách shop lệch.

**AC**
- [ ] Dữ liệu bình thường → báo cáo "khớp"
- [ ] Cố tình chèn một entry lệch trong test → báo cáo chỉ ra đúng shop lệch

### S12-05 · Audit phân quyền + xóa API deprecated
`Task` · Release v2.0 · **1 pt** · `api` `security`

- Rà soát mọi endpoint `/v1/seller/*` và `/v1/admin/*` bằng test ma trận (khách, seller khác shop, seller đúng shop, admin). Chạy `/security-review`.
- Xóa field/endpoint đã deprecated trong v2 (ví dụ `storeId` của category). Changelog có mục `BREAKING CHANGE`.

**AC**
- [ ] Bảng audit (endpoint × vai trò → kết quả mong đợi → test) nằm trong mô tả PR, không còn ô trống
- [ ] Không còn finding High từ `/security-review`
- [ ] OpenAPI không còn field deprecated

### S12-06 · Release v2.0.0 & retro
`Task` · Release v2.0 · **1 pt** · `devops` `docs`

- Release theo checklist. Smoke test toàn luồng marketplace trên production (xem Exit criteria trong [README v2](../README.md)).
- Retro sprint 12 và retro tổng v2. Lập backlog v3 (Self-host).

**AC**
- [ ] Tag `v2.0.0`, GitHub Release có changelog đầy đủ kèm mục BREAKING CHANGE
- [ ] `docs/retro/v2.md` đã có, Epic v3 đã tạo trên Jira
