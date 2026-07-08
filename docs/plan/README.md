# 📋 PIXELMART — MASTER PLAN INDEX

> **Dự án:** PixelMart — Multi-Vendor Marketplace
> **Tech Stack:** Express.js + Next.js + Prisma + PostgreSQL + Redis
> **Mục tiêu:** Portfolio + Learning (cân bằng)
> **Tác giả:** Review bởi Tech Lead AI

---

## 📊 Tổng Quan 16 Phases

| Phase | Tên | Độ khó | Thời lượng | Trạng thái |
|---|---|---|---|---|
| 01 | [Foundation & Setup](./be/phase-01-foundation-setup.md) | ⭐ | 10-15h | ✅ |
| 02 | [Database Design & ORM](./be/phase-02-database-design.md) | ⭐⭐ | 12-18h | ✅ |
| 03 | [Authentication & Authorization](./be/phase-03-authentication.md) | ⭐⭐⭐ | 15-20h | ✅ |
| 04 | [Shop & Seller Module](./be/phase-04-shop-seller.md) | ⭐⭐ | 10-15h | 🟡 |
| 05 | [Product Management (Seller)](./be/phase-05-product-management.md) | ⭐⭐ | 12-18h | 🟡 |
| 06 | [Product Display & SEO (Buyer)](./be/phase-06-product-display-seo.md) | ⭐⭐⭐ | 15-20h | ⬜ |
| 07 | [Cart & State Management](./be/phase-07-cart-state.md) | ⭐⭐⭐ | 12-18h | ⬜ |
| 08 | [Order & Checkout](./be/phase-08-order-checkout.md) | ⭐⭐⭐⭐ | 15-22h | ⬜ |
| 09 | [Review & Rating](./be/phase-09-review-rating.md) | ⭐⭐ | 8-12h | ⬜ |
| 10 | [Wishlist & Coupon](./be/phase-10-wishlist-coupon.md) | ⭐⭐ | 10-14h | ⬜ |
| 11 | [Admin Dashboard & Reports](./be/phase-11-admin-dashboard.md) | ⭐⭐⭐ | 12-18h | ⬜ |
| 12 | [Product Variants](./be/phase-12-product-variants.md) | ⭐⭐⭐⭐ | 15-20h | ⬜ |
| 13 | [Internationalization (i18n)](./be/phase-13-i18n.md) | ⭐⭐ | 10-14h | ⬜ |
| 14 | [Performance (Redis & Indexing)](./be/phase-14-performance-redis.md) | ⭐⭐⭐ | 12-16h | ⬜ |
| 15 | [Docker, CI/CD & Testing](./be/phase-15-docker-cicd-testing.md) | ⭐⭐⭐ | 15-20h | 🟡 |
| 16 | [Microservices & Monitoring](./be/phase-16-microservices-monitoring.md) | ⭐⭐⭐⭐⭐ | 25-35h | ⬜ |

**Tổng ước tính:** ~200-290 giờ (~5-7 tháng với 15-20h/tuần)

> **Chú thích trạng thái:** ✅ đã hoàn thành · 🟡 làm dở / một phần · ⬜ chưa bắt đầu.
> Trạng thái phản ánh **codebase hiện tại** (nguồn chân lý). Phase 04 mới xong luồng đăng ký shop (chưa có admin duyệt); Phase 05 mới xong module upload ảnh (chưa có Product/Category); Phase 15 mới có test vitest (chưa có Docker/CI).

---

## 🗺️ 3 Chặng Chính

```
CHẶNG 1: MONOLITH — Core Features (Phase 1-10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup → DB → Auth → Shop → Product → Display → Cart → Order → Review → Coupon
                                                                    ↓
CHẶNG 2: POLISH — Advanced Features (Phase 11-14)     ← MVP HOÀN THÀNH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Dashboard → Variants → i18n → Redis Caching
                                          ↓
CHẶNG 3: SCALE — Infrastructure (Phase 15-16)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Docker/CI → Microservices → Message Queue → Monitoring
```

---

## 📁 Tài Liệu Liên Quan

### Backend & Chung
| Tài liệu | Đường dẫn |
|---|---|
| **Folder Structure** | [folder-structure.md](./folder-structure.md) |
| **Plan Outline gốc** | [PlanOutline.md](./PlanOutline.md) |
| **ERD Diagram** | `docs/erd/` (tạo ở Phase 2) |

### 🌐 Frontend Web (Từng Cổng & Thư Viện Shared)
| Cổng | Thư mục Kế hoạch | Mô tả |
|---|---|---|
| **Shared Library** | [@pixelmart/shared](../../CLAUDE.md) | ✅ Đã triển khai — auth store / API client / schemas + UI dùng chung. Không có file plan riêng; xem mục `@pixelmart/shared` trong CLAUDE.md. |
| **Client (Buyer)** | [client](./fe/website/client/) | Next.js Buyer Storefront (SEO, SSR, Zustand, Checkout, VNPAY). |
| **Seller (Người bán)** | [seller](./fe/website/seller/) | Vite Seller Panel (CRUD sản phẩm, biến thể, hình ảnh). |
| **Admin (Quản trị)** | [admin](./fe/website/admin/) | Vite Admin Dashboard (Phê duyệt shop, vẽ biểu đồ Recharts). |


---

## ✅ Cách Sử Dụng Plan

1. **Đọc phase hiện tại** từ đầu đến cuối trước khi code
2. **Làm theo task order** — các task được sắp xếp theo dependency
3. **Check Definition of Done** sau mỗi task
4. **Check Checklist cuối phase** trước khi sang phase tiếp theo
5. **Đọc mục ⚠️ Lỗi fresher** — đây là kinh nghiệm thực chiến, đừng bỏ qua
6. **Commit thường xuyên** — mỗi task hoàn thành = 1 commit có message rõ ràng

---

> *"Hành trình vạn dặm bắt đầu từ một bước chân. Cứ làm từng phase một, đừng nghĩ tới Phase 16 khi chưa xong Phase 1."*
