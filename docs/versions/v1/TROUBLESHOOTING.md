# Troubleshooting V1

Các vấn đề dự kiến, được viết **trước khi** chúng xảy ra. Mỗi mục gồm: triệu chứng → nguyên nhân gốc → cách xác nhận → cách sửa. Những vấn đề ta thực sự gặp sẽ được đánh dấu _(đã gặp)_ kèm ngày.

## V1.1 — Docker và PostgreSQL

### `error during connect … dockerDesktopLinuxEngine: The system cannot find the file specified`
- **Nguyên nhân gốc:** Docker CLI không kết nối được tới Docker engine, thường là do Docker Desktop chưa chạy.
- **Xác nhận:** `docker version` có phần Client nhưng không có phần Server.
- **Sửa:** khởi động Docker Desktop và đợi tới khi thấy "Engine running".

### `Bind for 0.0.0.0:5432 failed: port is already allocated`
- **Nguyên nhân gốc:** có thứ gì đó trên máy host đang lắng nghe ở 5432, thường là một PostgreSQL Windows service được cài trực tiếp, hoặc một container khác.
- **Xác nhận:** PowerShell `Get-NetTCPConnection -LocalPort 5432` hoặc `docker ps` để tìm một postgres khác.
- **Sửa:** dừng service kia, hoặc đặt `POSTGRES_PORT=5433` trong `.env`. Chỉ phía **host** của ánh xạ port thay đổi; bên trong mạng Docker, Postgres vẫn lắng nghe ở 5432.

### `password authentication failed for user "pixelmart"` sau khi sửa `.env`
- **Nguyên nhân gốc:** `POSTGRES_USER`, `POSTGRES_PASSWORD` và `POSTGRES_DB` **chỉ được áp dụng khi thư mục dữ liệu còn trống** (lần khởi động đầu tiên). Đổi chúng về sau không làm thay đổi database đã tồn tại.
- **Xác nhận:** `docker volume ls` cho thấy volume cũ vẫn còn.
- **Sửa (dữ liệu dev có thể bỏ):** `docker compose down -v` rồi `pnpm db:up`. **Sửa (giữ dữ liệu):** `ALTER USER pixelmart WITH PASSWORD '…';` trong psql.
- **Lưu ý:** `psql` bên trong container có thể vẫn đăng nhập được mà không cần mật khẩu, vì image tin tưởng các kết nối qua socket local. Điều đó che giấu vấn đề này cho tới khi API kết nối qua TCP ở V1.3.

### Container PostgreSQL 18 lỗi, báo về thư mục dữ liệu / cấu trúc volume cũ
- **Nguyên nhân gốc:** từ PostgreSQL 18, image chính thức lưu dữ liệu trong một thư mục con theo từng version và yêu cầu volume được mount tại **`/var/lib/postgresql`**, chứ không phải `/var/lib/postgresql/data` như nhiều hướng dẫn cũ.
- **Sửa:** mount named volume tại `/var/lib/postgresql`. Không bao giờ dùng lại volume được tạo bởi một major version cũ hơn. Nâng major version cần `pg_upgrade` hoặc dump/restore (học ở V15).

### Init script không chạy (thiếu `pixelmart_test`)
- **Nguyên nhân gốc:** các script trong `/docker-entrypoint-initdb.d` chỉ chạy ở lần khởi tạo đầu tiên. Nếu volume đã tồn tại, chúng bị bỏ qua.
- **Sửa:** `docker compose down -v && pnpm db:up`, hoặc tạo database bằng tay một lần.

### Shell init script lỗi `/bin/sh^M: bad interpreter`
- **Nguyên nhân gốc:** line ending CRLF của Windows trong một script được Linux thực thi.
- **Phòng tránh:** `.gitattributes` với `* text=auto eol=lf`. Init script của V1 là file `.sql`, chịu được CRLF, nhưng các file `.sh` về sau thì không.

### `pnpm install` cảnh báo build script bị bỏ qua (ví dụ Prisma, argon2) _(dự kiến từ V1.3)_
- **Nguyên nhân gốc:** các version pnpm gần đây không chạy lifecycle script của dependency trừ khi bạn cho phép rõ ràng. Đây là biện pháp bảo mật chuỗi cung ứng (supply chain).
- **Sửa:** phê duyệt các package cụ thể (pnpm in ra lệnh cần chạy). Commit cấu hình sinh ra trong `pnpm-workspace.yaml`. Chỉ phê duyệt những package bạn nhận ra.

## Các sprint sau của V1 (dự kiến)

| Sprint | Vấn đề có thể gặp | Gợi ý nguyên nhân gốc |
|---|---|---|
| V1.3 | Cài `prisma` ra version `8.0.0-rc.x` | dist-tag `latest` đang trỏ tới một bản RC. Cố định chính xác `7.10.0` ([ADR-0002](../../decisions/0002-tool-and-dependency-versions.md)). |
| V1.3 | Không tìm thấy `DATABASE_URL` khi chạy Prisma CLI | Prisma 7 không tự động load `.env`. Hãy load nó trong `prisma.config.ts`. |
| V1.3 | `Can't reach database server at localhost:5432` | DB chưa chạy/chưa healthy, sai port, hoặc sai host (`localhost` khi từ máy bạn, còn `postgres` khi từ bên trong Docker ở V4). |
| V1.5 | Ảnh từ host bên ngoài lỗi trong `next/image` | Host chưa được liệt kê trong `images.remotePatterns`. |
| V1.6 | Cảnh báo "Hydration failed" | Server render một cart rỗng trong khi client render nội dung từ localStorage. Chỉ đọc localStorage sau khi component đã mount. |
| V1.7 | Tổng tiền kiểu `59.970000000000006` | Đâu đó đang tính bằng Number thay vì Decimal. |
| V1.8 | Cookie không được gửi lên server | Sai các flag `path`/`sameSite`/`secure`. `secure: true` trên http://localhost thuần sẽ lỗi ở một số trình duyệt. |
