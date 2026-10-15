# ADR-0005: Thanh toán online với Stripe (test mode) ở V3

- Trạng thái: **Proposed (Đề xuất).** Vị trí trong roadmap đã được chấp nhận ngày 2026-10-15. Chi tiết tích hợp sẽ được xác nhận khi bắt đầu V3, lúc đó ADR này chuyển sang Accepted (Đã chấp nhận).
- Ngày: 2026-10-15

## Bối cảnh

Dự án cần một luồng thanh toán bằng thẻ để demo, bên cạnh thanh toán khi nhận hàng (COD). Thanh toán là phần dễ hỏng nhất của e-commerce:

- tiền di chuyển bên ngoài hệ thống của ta;
- xác nhận đến **bất đồng bộ**;
- mạng có thể gửi lại (retry);
- khách hàng đóng tab giữa chừng.

Tích hợp phải đúng, chứ không chỉ là "đã redirect tới trang thành công".

## Vị trí trong roadmap

| Phương án | Vấn đề |
|---|---|
| Trong V1 | Chưa có reservation tồn kho và chưa có idempotency. Dẫn tới trừ tiền hai lần khi retry và đơn hàng "đã trả tiền nhưng hết hàng". Quá nhiều khái niệm mới cùng lúc cho một MVP. |
| **Version riêng ngay sau V2** ✅ | V2 cung cấp reservation tồn kho và checkout idempotent, là nền cho thanh toán. Webhook test được ở local bằng Stripe CLI, nên không cần deploy. Các version sau (Docker, CI, deploy) sẽ đưa toàn bộ luồng lên. |
| Sau deployment / messaging (V6+) | Không có lý do kỹ thuật để chờ. Thanh toán là tính năng kinh doanh cốt lõi. Container, CI và deployment sẽ phải làm lại cho nó. |

## Cách tiếp cận đề xuất (xác nhận ở V3)

| Chủ đề | Mặc định | Phương án khác và đánh đổi |
|---|---|---|
| Tích hợp UI | **Stripe Checkout (trang do Stripe host)**. Dữ liệu thẻ không bao giờ chạm vào server của ta. Phạm vi PCI nhỏ nhất. Stripe xử lý 3-D Secure/SCA. | Payment Element (nhúng vào trang): toàn quyền kiểm soát UI, nhưng nhiều code client và nhiều trạng thái phải xử lý hơn. Là bài lab mở rộng tùy chọn. |
| Chế độ | **Chỉ test mode** (key `sk_test_…`, thẻ test như `4242 4242 4242 4242`). Live key không bao giờ xuất hiện trong dự án này. | — |
| Source of truth | **Webhook** `checkout.session.completed` (cùng `…expired`, `charge.refunded`), được xác minh bằng signing secret. Redirect tới trang thành công chỉ để *hiển thị* trạng thái. | Polling Session API: chấp nhận được làm phương án dự phòng để hiển thị, không bao giờ dùng để xử lý đơn (fulfilment). |
| Bảo mật webhook | Xác minh chữ ký trên **raw request body** (NestJS `rawBody: true`). Từ chối mọi request không có chữ ký hoặc đã quá hạn. | — |
| Event trùng lặp / sai thứ tự | Bảng `stripe_events` với `event_id` unique. Xử lý trong một DB transaction. Chuyển trạng thái là idempotent (`PAID` vẫn là `PAID`). | — |
| Mô hình dữ liệu | Bảng mới `payments` (một đơn hàng có 1–N lần thử thanh toán: provider, session id, số tiền, loại tiền, trạng thái). Trạng thái đơn hàng có thêm `AWAITING_PAYMENT` / `PAID`. `payment_method` trên orders: `COD` hoặc `CARD`. | Chỉ thêm cột vào `orders`: đơn giản hơn, nhưng mất lịch sử các lần thử thất bại. |
| Số tiền | Giữ `numeric(12,2)` trong DB của ta ([ADR-0003](0003-money-representation.md)). Chỉ chuyển sang **số nguyên đơn vị nhỏ nhất** ở ranh giới với Stripe, trong một hàm duy nhất có test. | — |
| Gọi API ra ngoài | **Idempotency key** của Stripe sinh từ id lần thử thanh toán của ta, để khi chính ta retry thì không tạo session trùng. | — |
| Bỏ dở thanh toán | Session hết hạn ngắn. `checkout.session.expired` giải phóng reservation tồn kho của V2 và hủy lần thử. | — |
| Refund | Admin hủy một đơn đã thanh toán → refund qua API → được xác nhận bằng webhook `charge.refunded`. | — |
| Dev ở local | Stripe CLI: `stripe listen --forward-to localhost:4000/payments/webhook`. `stripe trigger` cho các trường hợp biên. | — |
| SDK | `stripe` (Node), phiên bản chính xác và API version được ghim khi bắt đầu V3. `23.0.0` là major mới nhất tại ngày 2026-10-15. | — |

## Hệ quả

- ➕ Dạy về webhook, xác minh chữ ký, idempotency, trạng thái bất đồng bộ và lỗi từ hệ thống bên ngoài. Những kiến thức này dùng thẳng cho RabbitMQ (V12) và outbox (V13).
- ➕ Các version sau mở rộng tự nhiên: V6 webhook secret theo từng môi trường · V7 proxy không được sửa body của webhook · V10 metrics thanh toán/webhook · V12 email thanh toán · V13 event `order.paid` qua outbox · V15 đối soát Stripe↔DB.
- ➖ Thêm một version trước Docker và deployment, khiến chúng lùi lại một bước.
- ➖ Cần một tài khoản Stripe miễn phí (test mode) và cài Stripe CLI ở máy local.
- V1 vẫn chỉ có COD. Việc thêm trạng thái thanh toán ở V3 là một **bài tập tiến hóa schema** có chủ đích: giá trị enum mới, bảng mới, và backfill các đơn hàng cũ thành `COD`.
