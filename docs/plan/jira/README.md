# 🏃 PixelMart — Agile Plan cho Jira

> Chốt ngày: **14/08/2026**. Nguồn chân lý là codebase, không phải `docs/plan/README.md` (bảng trạng thái ở đó đã lệch).
> File import: [`backlog.csv`](./backlog.csv) — 14 Epic, 82 Story, 278 SP, 14 sprint.

---

## 1. Trạng thái codebase hiện tại

| Vùng                | Đã xong                                                                                                                              | Còn thiếu                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **server** modules  | `auth`, `user`, `vendor`, `upload`, `category`, `brand`, `product`                                                                    | `cart`, `order`, `payment`, `review`, `coupon`, `wishlist`, `notification`, `report`                  |
| **Prisma schema**   | User/RBAC/Address/Vendor+KYC/DeliveryPerson/Brand/Category/Product/Variant/Image                                                      | **Không có** Cart, Order, OrderItem, Payment, Review, Coupon, Wishlist → cả nửa sau nghiệp vụ chưa có |
| **product module**  | create product, create variant, list vendor/admin, get by id, approve/reject                                                          | **update/delete product & variant**, quản lý ảnh, filter/search/pagination cho catalog public         |
| **admin** portal    | Users, Vendors + VendorDetail, Review Queue, Product Review, Categories, Brands, Design System                                        | 7 route còn là `<Placeholder>`: analytics ×2, roles, flagged, promotions, settings, audit-log         |
| **vendor** portal   | Login/Register/RegisterVendor, Products list, Product detail + variants table                                                         | 9 route `<Placeholder>`: orders ×2, analytics ×3, vouchers, chat, reviews, profile                    |
| **client** (Next)   | landing (6 section), auth (login/register/guard)                                                                                      | `products`, `products/[slug]`, `checkout`, `payment`, `profile` **đều đang là stub 5 dòng**           |
| **infra**           | vitest (5 test file), rate limiter, helmet, CORS, Cloudinary upload                                                                   | **không có** Dockerfile, docker-compose, GitHub Actions, Redis, i18n, logging/metrics                 |

### Điểm cần sửa phát hiện khi review

1. `product.service.ts:22` — `getAllProductsVariant()` `findMany` **không pagination, không filter**. Có 5.000 variant là trả về hết. → Sprint 2.
2. `schema.prisma:385` — `ProductImage.variant` là quan hệ optional không khai `onDelete`, mặc định `SetNull` → xoá variant sẽ để lại ảnh mồ côi trong Cloudinary + DB. → Sprint 1.
3. `VendorVerification` copy lại toàn bộ field địa chỉ (`street/ward/province/recipientName/phone`) trong khi model `Address` đã có `ownerType = VENDOR`. Trùng lặp có chủ đích thì nên ghi chú, còn không thì nên gộp.
4. `Address.wardID` / `provinceId` là `String` tự do, không validate, không quan hệ. Sẽ vỡ khi tính phí ship. → xử lý ở Sprint 4.
5. Không có `update`/`delete` sản phẩm → vendor tạo sai là chịu. Đây là lỗ hổng lớn nhất của MVP hiện tại. → Sprint 1, priority Highest.
6. `vendor/.../mocks/product-detail.mock.ts` vẫn đang được UI dùng (đang sửa dở trong working tree). → Sprint 1.
7. `README.md` = 12 byte. Dự án portfolio thì đây là thứ nhà tuyển dụng đọc đầu tiên. → Sprint 14.
8. `Product.status` + `approvalStatus` là 2 trục riêng; `PUBLIC_PRODUCT` đang lọc đúng — **giữ nguyên hằng số đó**, đừng viết lại điều kiện lọc ở query mới.

**Điểm làm tốt, đừng đổi:** `price Int` (đồng, không float), soft delete `deletedAt`, `findFirst` thay `findUnique` ở PDP để không leak sản phẩm ẩn, RBAC bảng riêng, refresh token trong DB.

---

## 2. Cấu hình Jira

**Project:** Scrum, company-managed (cần `Epic Link` + `Story Points` — team-managed sẽ phải map `Epic Link` → `Parent`).
**Key:** `PM`.

| Thiết lập         | Giá trị                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Sprint            | 2 tuần, bắt đầu thứ 2                                                         |
| Capacity          | 15–20h/tuần → **~35h/sprint**                                                 |
| Story Point       | **1 SP ≈ 2h** → velocity mục tiêu **17 SP/sprint**                            |
| Components        | `server`, `client`, `admin`, `vendor`, `shared`, `infra`                       |
| Workflow          | `To Do → In Progress → In Review → Done` (+ `Blocked`)                        |
| Branch convention | `feat/PM-123-slug`, `fix/PM-123-slug` — commit message mở đầu bằng issue key  |

**Definition of Done** (dán vào mô tả project):

- [ ] `pnpm lint` + `pnpm build` pass ở mọi app bị ảnh hưởng
- [ ] Logic không tầm thường có test (integration test cho endpoint, đúng convention `src/modules/<m>/tests/`)
- [ ] Endpoint mới có Zod validation + guard phân quyền + dùng `ApiError`/`ApiResponse`
- [ ] UI mới theo Mint Fresh token (`DESIGN.md`), không hardcode màu, không dùng `neon-*`/`pixel-*`
- [ ] Migration được tạo bằng `pnpm prisma migrate dev`, không sửa DB tay
- [ ] Không còn mock data trong đường đi thật
- [ ] Self-review trên PR, CI xanh

**Nghi thức (solo dev — bỏ họp, giữ output):**

| Khi nào              | Việc                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| Đầu sprint (30′)     | Sprint planning: kéo đúng ~17 SP, không hơn                               |
| Mỗi ngày (5′)        | Viết 3 dòng vào comment issue đang làm: hôm qua / hôm nay / blocker        |
| Cuối sprint (45′)    | Review: demo được bằng browser thật, không phải bằng unit test            |
| Cuối sprint (15′)    | Retro: 1 điều giữ, 1 điều bỏ. Ghi velocity thực tế để hiệu chỉnh sprint sau |

---

## 3. Roadmap 14 sprint

| Sprint | Ngày                    | Mục tiêu (Sprint Goal)                                              | SP  |
| ------ | ----------------------- | ------------------------------------------------------------------- | --- |
| 1      | 17/08 – 28/08/2026      | Vendor sửa/xoá được sản phẩm & variant; admin duyệt được vendor      | 20  |
| 2      | 31/08 – 11/09/2026      | Khách xem được catalog + PDP thật, SSR chuẩn SEO, có filter/search   | 22  |
| 3      | 14/09 – 25/09/2026      | Giỏ hàng guest + DB, merge khi login                                | 18  |
| 4      | 28/09 – 09/10/2026      | Đặt hàng được: transaction, tách đơn theo vendor, sổ địa chỉ         | 22  |
| 5      | 12/10 – 23/10/2026      | Thanh toán VNPay sandbox chạy end-to-end, IPN an toàn               | 18  |
| 6      | 26/10 – 06/11/2026      | **🎯 MVP** — vòng đời đơn hàng đủ 3 phía (khách/vendor/admin)         | 21  |
| 7      | 09/11 – 20/11/2026      | Đánh giá & rating                                                   | 18  |
| 8      | 23/11 – 04/12/2026      | Wishlist + coupon/voucher                                           | 21  |
| 9      | 07/12 – 18/12/2026      | Dashboard & báo cáo cho admin + vendor                              | 21  |
| 10     | 21/12 – 01/01/2027      | Docker + CI/CD + nâng độ phủ test (sprint có lễ, đã trừ)             | 20  |
| 11     | 04/01 – 15/01/2027      | Redis cache, index DB, tối ưu frontend                              | 16  |
| 12     | 18/01 – 29/01/2027      | i18n vi/en                                                          | 14  |
| 13     | 01/02 – 12/02/2027      | Tách service + API Gateway + RabbitMQ                               | 23  |
| 14     | 15/02 – 26/02/2027      | K8s, monitoring, seed demo, README, security pass → **ship**         | 24  |

**Ngày hoàn thành dự kiến: 26/02/2027.** Cắt ở Sprint 6 (**06/11/2026**) là có sản phẩm bán được thật.

### Thứ tự phụ thuộc (không đảo được)

```
S1 catalog CRUD ─→ S2 catalog public ─→ S3 cart ─→ S4 order ─→ S5 payment ─→ S6 fulfilment
                                                        │
                          S7 review ←──────────────────┘ (cần đơn DELIVERED)
                          S8 coupon ←──────────────────┘ (cần checkout)
                          S9 report ←──────────────────┘ (cần dữ liệu đơn)

S10 Docker ─→ S13 microservices ─→ S14 K8s        (S11, S12 chèn được bất kỳ đâu sau S6)
```

---

## 4. Cách import

1. Jira → **Settings → System → External System Import → CSV** → upload `backlog.csv`.
2. Map field: `Issue Type`, `Summary`, `Description`, `Epic Name`, `Epic Link`, `Components` (delimiter `;`), `Labels`, `Story Points` → *Story point estimate*, `Sprint`, `Priority`.
3. Tick **Map field value** cho `Components` để Jira tự tạo component.
4. Import Epic trước rồi Story? — Không cần, Jira xử lý được trong 1 lần vì `Epic Link` khớp `Epic Name`.
5. Sau import: vào Backlog, đặt ngày start/end cho từng sprint theo bảng trên, rồi Start Sprint 1.

Trước khi import, cân nhắc bỏ hẳn Epic 13 (Microservices) và 12 (i18n) nếu mục tiêu là **ship nhanh** thay vì **học kiến trúc** — cắt được 37 SP ≈ 2.5 sprint.
