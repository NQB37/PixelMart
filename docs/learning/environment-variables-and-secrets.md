# Environment Variables và Secrets

## 1. Nó là gì
**Environment variable** là các cặp key–value mà hệ điều hành truyền cho một process khi nó khởi động (`DATABASE_URL=postgresql://…`). **File `.env`** là một tiện ích: một file text chứa các cặp như vậy, được một công cụ nạp vào môi trường. **Secret** là những giá trị cấu hình cấp quyền truy cập: mật khẩu, API key, signing key.

## 2. Tại sao nó tồn tại
Cùng một đoạn code chạy ở nhiều nơi khác nhau (laptop của bạn, CI, staging, production), với database, thông tin đăng nhập và URL khác nhau. Cấu hình thay đổi theo môi trường phải nằm **bên ngoài** code. Đây là yếu tố III của "Twelve-Factor App".

## 3. Vấn đề nó giải quyết
- Không hard-code mật khẩu hay hostname trong source code.
- Một build artifact có thể được chuyển từ staging lên production với cấu hình khác.
- Có thể đổi (rotate) secret mà không cần sửa code.

## 4. Ví dụ đời thực
Hệ thống thẻ từ của khách sạn. Cánh cửa (code) ở phòng nào cũng giống nhau, còn mỗi thẻ mở được cửa nào thì được lập trình riêng (env). Bạn sẽ không bao giờ khắc mã chủ lên chính cánh cửa (commit nó vào git).

## 5. Cách hoạt động (mức cơ bản)
- Mỗi process đều có một môi trường. Node đọc nó qua `process.env.NAME`. Giá trị **luôn là chuỗi**, nên `"false"` vẫn là truthy và `PORT` cần được parse.
- File `.env` **không phải** tính năng của Node hay hệ điều hành. Phải có công cụ nạp nó: Docker Compose (để thay biến trong YAML), ConfigModule của Nest, Next.js, hoặc file config của Prisma.
- **Thứ tự ưu tiên:** biến đã được đặt trong môi trường thật thường thắng file `.env`. Đó là cách CI và production ghi đè giá trị mặc định ở local.
- `.env.example` được commit và ghi lại **mọi** biến với giá trị giả. `.env` chứa giá trị thật và bị git bỏ qua.
- **Quy tắc riêng của Next.js:** biến có tiền tố `NEXT_PUBLIC_` được nhúng thẳng vào bundle JavaScript của trình duyệt lúc build, nên chúng là công khai. Secret và URL nội bộ không bao giờ được dùng tiền tố này.

## 6. Khi nào nên dùng
Cho mọi thứ khác nhau giữa các môi trường, hoặc mang tính bí mật: URL database, thông tin đăng nhập, JWT secret, API key bên ngoài, feature flag, port.

## 7. Khi nào không nên dùng
- Cấu hình nghiệp vụ mà admin thay đổi lúc runtime (ví dụ giờ mở cửa của cửa hàng). Thứ đó thuộc về database.
- Cấu hình lớn có cấu trúc. Dùng file config được validate lúc khởi động.
- Làm nơi lưu secret *an toàn* trong production. Env var có thể lộ qua crash dump, `docker inspect` và các process con. V15 sẽ nói về quản lý secret đúng cách.

## 8. Vị trí trong PixelMart
- V1.1: `.env` ở thư mục gốc chứa `POSTGRES_*`, được Docker Compose dùng.
- V1.2: API validate env lúc khởi động và **dừng ngay (fail fast)** với thông báo rõ ràng nếu thiếu hoặc sai định dạng.
- V1.5: `API_INTERNAL_URL` của web chỉ dùng trên server (không có `NEXT_PUBLIC_`). Xem [ADR-0004](../decisions/0004-web-calls-api-server-side.md).
- Sau này: giá trị theo từng môi trường nằm trong Coolify (V6) và secret của GitHub Actions (V5/V11), không bao giờ nằm trong repo.

## 9. Bài tập thực hành
Sau V1.1: chạy `docker compose config` và xem Compose đã thay các giá trị từ `.env` vào YAML như thế nào. Sau đó đặt tạm biến trong shell (`POSTGRES_PORT=5544 docker compose config` trong Git Bash) và quan sát giá trị từ shell thắng.

## 10. Lỗi thường gặp và cách debug
- **Commit `.env`.** Nếu đã lỡ, xóa file trong commit sau là **không** đủ: secret vẫn nằm trong lịch sử git. Hãy rotate secret ngay.
- Quên khởi động lại process sau khi sửa `.env`. Env chỉ được đọc lúc khởi động.
- Coi `"false"`/`"0"` là boolean false.
- Đặt secret vào `NEXT_PUBLIC_*`.
- Debug: in ra **tên** các biến đã nạp, không bao giờ in giá trị. Dùng `docker compose config` để xem Compose thực sự resolve ra gì.

## 11. Câu hỏi phỏng vấn
- **Tại sao không hard-code cấu hình?** Vì môi trường khác nhau, secret bị lộ qua repo, và không rotate được nếu không deploy lại code.
- **`.env` có an toàn không?** Nó chỉ là file tiện ích ở local. An toàn đến từ việc giữ nó ngoài git và dùng một secret store thật trong production.
- **Chuyện gì xảy ra nếu bạn lỡ push một secret?** Coi như nó đã bị lộ: rotate nó. Viết lại lịch sử chỉ là việc thứ yếu, vì các bản clone và fork có thể đã có nó rồi.

## 12. Tài liệu tham khảo
- The Twelve-Factor App, III. Config: https://12factor.net/config
- Thay biến trong Docker Compose: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/
- Environment variable trong Next.js: https://nextjs.org/docs/app/guides/environment-variables
- Cấu hình NestJS: https://docs.nestjs.com/techniques/configuration
