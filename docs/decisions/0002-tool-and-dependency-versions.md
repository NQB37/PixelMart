# ADR-0002: Phiên bản công cụ và dependency cho V1

- Trạng thái: Accepted (Đã chấp nhận)
- Ngày: 2026-10-15

## Bối cảnh

Dự án kéo dài nhiều tháng. Peer dependency không khớp là nguyên nhân phổ biến nhất gây ra lỗi cài đặt khó hiểu cho người mới. Các phiên bản được kiểm tra trên npm registry ngày 2026-10-15.

## Quyết định

| Thành phần | Phiên bản | Bằng chứng / lý do |
|---|---|---|
| Node.js | 24.x LTS | Đã cài sẵn (24.19.0). Đáp ứng Prisma 7 (`>=24`) và nestjs-pino (`>=22.12`). |
| pnpm | 12.4.2 | Đã cài sẵn. Ghim qua `packageManager` để mọi người (và CI) dùng cùng một phiên bản. |
| TypeScript | **6.0.x** | TypeScript 7.0 (compiler native mới) đang là `latest`, nhưng `@nestjs/swagger@12.0.2` khai báo peer `typescript ^5.5 \|\| ^6.0`, `@nestjs/cli@12.0.8` phụ thuộc `typescript ~6.0.2`, và template dự án NestJS 12 dùng `^6.0.2`. Các công cụ dùng TypeScript compiler API (Swagger plugin của Nest CLI, ts-jest) chưa hỗ trợ TS 7. **Xem xét lại ở V5 (CI).** |
| NestJS | 12.1.x | 12.0.0 phát hành ngày 2026-08-27. Đã kiểm tra hệ sinh thái: `@nestjs/swagger` 12, `@nestjs/config` 12.0.1 (`^11 \|\| ^12`), `@nestjs/jwt` 12, `nestjs-pino` 5.3.1 (`^11.0.8 \|\| ^12.0.2`). Template 12.x dùng Jest 30 (ESM), oxlint và TS 6. |
| Prisma | **Đúng 7.10.0**, CLI và `@prisma/client` giống hệt nhau | ⚠ Ngày 2026-10-15, dist-tag `latest` của package `prisma` trỏ tới **`8.0.0-rc.23`, một bản pre-release**, trong khi `@prisma/client@latest` là 7.10.0. Chạy `pnpm add prisma` mà không ghi phiên bản sẽ cài một bản release candidate không khớp với client. Luôn cài `prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0`. |
| PostgreSQL | 18 (`postgres:18-alpine`) | Major hiện tại. Lưu ý: image chính thức đã đổi cấu trúc thư mục dữ liệu từ bản 18 (xem V1 TROUBLESHOOTING). |
| Next.js | 16.4.x, React 19.x | Dòng stable hiện tại. Next 16 dùng `proxy.ts` (trước đây là `middleware.ts`) và mặc định dùng Turbopack. |
| Tailwind CSS | 4.x | Viết style nhanh mà không cần thiết kế kiến trúc CSS trước. Bản thân nó không phải mục tiêu học. |
| Test API | Jest 30 + supertest | Mặc định của template NestJS 12. Unit test và integration test ở mức HTTP. |
| Test web | Vitest + Testing Library | Chọn phiên bản cụ thể ở V1.6 (Vitest 5 còn rất mới). |

## Quy tắc

1. **Lockfile mới là nơi ghim phiên bản thật sự.** `pnpm-lock.yaml` được commit. Trong CI dùng `pnpm install --frozen-lockfile`.
2. **Chỉ đổi major qua ADR.** Trước khi nâng major, kiểm tra peer dependency của các package phụ thuộc vào nó.
3. **Đừng tin `latest` một cách mù quáng.** Kiểm tra `npm view <pkg> dist-tags` (xem trường hợp Prisma ở trên).

## Hệ quả

- ➕ Có một baseline đã biết là tương thích. Khi gặp vấn đề có thể so với tài liệu này.
- ➖ Ta sẽ chậm một major TypeScript trong một thời gian. Việc nâng cấp đã được lên lịch, không bị bỏ quên.
