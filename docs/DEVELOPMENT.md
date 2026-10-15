# Môi trường phát triển

## Cấu hình máy hiện tại (ghi nhận ngày 2026-10-15)

| Công cụ | Đã cài | Yêu cầu | Ghi chú |
|---|---|---|---|
| Node.js | 24.19.0 | 24.x LTS | Prisma 7 cần `^20.19 \|\| ^22.12 \|\| >=24`. nestjs-pino cần `>=22.12`. |
| pnpm | 12.4.2 | 12.4.x | Được ghim qua `packageManager` trong `package.json` ở thư mục gốc. |
| Git | 2.55 | bản mới gần đây | Đặt `core.autocrlf=false`. Ký tự xuống dòng do `.gitattributes` xử lý. |
| Docker Engine / Desktop | 29.8.0 | 27+ | Docker Desktop phải **đang chạy** trước mọi lệnh `docker`. |
| Docker Compose | v5.5.1 | cú pháp v2+ | Dùng `docker compose` (có dấu cách), không dùng `docker-compose` kiểu cũ. |
| psql (local) | chưa cài | không cần | Dùng `psql` bên trong container: `pnpm db:psql`. |

Hệ điều hành: Windows 11. Các lệnh trong tài liệu này được viết cho POSIX shell (Git Bash). Những chỗ khác biệt với PowerShell sẽ được ghi chú khi cần.

Editor: VS Code với các extension ESLint, Prettier, Prisma, Docker và EditorConfig.

## Các phiên bản đã chọn

Xem [ADR-0002](decisions/0002-tool-and-dependency-versions.md) để biết bằng chứng và lý do. Phiên bản chính xác sau khi resolve luôn nằm trong `pnpm-lock.yaml`.

| Tầng | Lựa chọn |
|---|---|
| Ngôn ngữ | TypeScript **6.0.x** (cố ý chưa dùng 7.0) |
| Backend | NestJS **12.1.x**, nền tảng Express |
| Validation | class-validator 0.15 + class-transformer |
| Tài liệu API | @nestjs/swagger 12 |
| Logging | nestjs-pino 5.3 + pino 10 |
| ORM | Prisma **7.10.0** (CLI và client được ghim cùng một phiên bản chính xác) + `@prisma/adapter-pg` |
| Database | PostgreSQL **18** (`postgres:18-alpine`) |
| Frontend | Next.js **16.4.x**, React 19, App Router, Tailwind CSS 4 |
| Test API | Jest 30 + supertest (mặc định trong scaffold của NestJS 12) |
| Test web | Vitest + React Testing Library (phiên bản được ghim ở V1.6) |

## Port

| Service | Port | Có từ |
|---|---|---|
| PostgreSQL | 5432 (cấu hình qua `POSTGRES_PORT`) | V1.1 |
| NestJS API | 4000 | V1.2 |
| Next.js web | 3000 | V1.5 |

## Lệnh dùng hằng ngày

_Được bổ sung khi mỗi sprint thêm lệnh mới. Chỉ liệt kê những lệnh đã được kiểm chứng._

(chưa có — V1.1 thêm `db:up`, `db:down`, `db:logs`, `db:psql`)
