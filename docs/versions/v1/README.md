# V1 — Working MVP

## Phạm vi

Một ứng dụng e-commerce nhỏ nhưng chạy được đầy đủ, chạy trên máy local.

**Khách guest (không cần tài khoản):** duyệt các sản phẩm đã publish · xem chi tiết và ảnh sản phẩm · duyệt theo danh mục · cart trong trình duyệt (thêm, đổi số lượng, xoá) · checkout với hình thức thanh toán khi nhận hàng (cash on delivery) · trang xác nhận kèm mã đơn hàng.

**Admin (tài khoản được seed sẵn):** đăng nhập · CRUD danh mục · CRUD sản phẩm · đặt image URL · publish/unpublish · xem danh sách, xem chi tiết và đổi trạng thái đơn hàng. Mọi API endpoint của admin đều yêu cầu token hợp lệ **và** role `ADMIN`.

## Kết quả mong đợi

Từ một bản clone sạch, làm theo README ở thư mục gốc:

```
pnpm install → pnpm db:up → pnpm db:migrate → pnpm db:seed → pnpm dev
```

Bạn sẽ có storefront tại `http://localhost:3000`, khu vực admin tại `/admin`, API tại `http://localhost:4000` và Swagger tại `http://localhost:4000/docs`. (Các lệnh chính xác sẽ được chốt và kiểm chứng ở V1.11.)

## Cố ý không đưa vào V1

| Không đưa vào | Lý do / khi nào |
|---|---|
| Tài khoản khách hàng, đăng ký, đặt lại mật khẩu | V2. Guest checkout là đủ để học luồng đặt hàng. |
| **Tồn kho / stock** | V2. V1 không có cột stock. **Mọi sản phẩm đã publish đều đặt được.** Chúng ta không giả vờ là đang quản lý tồn kho. |
| **Chống gửi trùng ngoài phạm vi UI** | V1 chỉ vô hiệu hoá nút submit trong lúc request đang chạy. Một request được gửi lại vẫn có thể tạo đơn hàng thứ hai. V2 thêm idempotency key (UUID do client sinh, unique trong DB). V13 xử lý phần tương đương ở phía event. |
| Thanh toán bằng thẻ | V3 (Stripe test mode, [ADR-0005](../../decisions/0005-online-payments-stripe.md)). V1 chỉ có cash on delivery. Thanh toán cần reservation tồn kho và idempotency của V2 trước. |
| Tìm kiếm sản phẩm, bộ lọc ngoài danh mục | V2. |
| Upload ảnh | V8 (R2). V1 dùng một trường image **URL** cùng với ảnh được seed sẵn. Upload đòi hỏi các quyết định về lưu trữ, mà ta chưa học tới. |
| Email | V12 (RabbitMQ). Cho thấy vì sao các side effect nên chạy bất đồng bộ. |
| Phí vận chuyển, thuế, giảm giá | Schema đã chừa chỗ (`subtotal` và `total`). Phần logic để sau. |
| Danh mục nhiều cấp, biến thể sản phẩm | Ngoài phạm vi. Danh mục một cấp, mỗi sản phẩm một SKU. |
| Docker image cho web/api | V4. Ở V1, Docker **chỉ chạy PostgreSQL**. |
| Cache, queue, metrics, deployment | Các version sau, mỗi thứ được đưa vào khi có lý do. |
| Đa ngôn ngữ (internationalisation) | Không có kế hoạch. |

## Tài liệu

- [LEARNING.md](LEARNING.md): khái niệm theo từng sprint
- [IMPLEMENTATION.md](IMPLEMENTATION.md): kế hoạch theo từng sprint
- [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md): định nghĩa "hoàn thành" có thể kiểm chứng
- [ARCHITECTURE.md](ARCHITECTURE.md): luồng request, các API endpoint, quy ước về lỗi và pagination
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md): các vấn đề dự kiến sẽ gặp
