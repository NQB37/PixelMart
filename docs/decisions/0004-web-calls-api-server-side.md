# ADR-0004: Next.js chỉ gọi API từ phía server (V1)

- Trạng thái: Accepted (Đã chấp nhận)
- Ngày: 2026-10-15

## Bối cảnh

Trình duyệt cần dữ liệu catalog, phải gửi checkout, và admin phải gọi các endpoint được bảo vệ. Trình duyệt có thể gọi thẳng NestJS, hoặc Next.js gọi NestJS từ phía server.

## Các phương án đã cân nhắc

1. **Trình duyệt → NestJS trực tiếp** (`fetch` phía client). Cần CORS. Token admin phải đọc được bằng JavaScript, hoặc được gửi cross-site dưới dạng cookie. API phải truy cập được công khai.
2. **Trình duyệt → server Next.js → NestJS.** Server Component lấy dữ liệu. Server Action xử lý các thao tác ghi (mutation). Được chọn.

## Quyết định

- Các trang catalog là **Server Component**, gọi API bằng `fetch` trên server.
- Checkout và mọi thao tác ghi của admin là **Server Action**, gọi API trên server.
- JWT của admin được lưu trong **cookie httpOnly, SameSite=Lax** trên origin của web. Next.js đọc cookie trên server và chuyển tiếp dưới dạng `Authorization: Bearer …`. JavaScript trên trình duyệt không bao giờ thấy token.
- Base URL của API (`API_INTERNAL_URL`) là environment variable **chỉ dùng trên server** (không có tiền tố `NEXT_PUBLIC_`).
- Cart là phần state duy nhất chỉ nằm ở client (localStorage, Sprint V1.6). Nó không cần gọi API cho tới lúc checkout.

## Hệ quả

- ➕ Không cần cấu hình CORS ở V1. Token không bao giờ nằm ở nơi lưu trữ mà XSS đọc được. Từ V6 trở đi, API có thể nằm trong mạng riêng.
- ➕ Khớp với luồng request mục tiêu: Browser → Next.js → NestJS → PostgreSQL.
- ➖ Mỗi lần gọi API tốn thêm một bước qua server. Chấp nhận được ở quy mô này, và sau này cache của Next.js có thể bù lại.
- ➖ App di động hoặc bên thứ ba sau này sẽ cần truy cập API trực tiếp. CORS và xác thực cho public API sẽ được thiết kế khi đó (V2+).
