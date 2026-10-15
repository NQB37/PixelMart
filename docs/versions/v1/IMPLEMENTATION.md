# Kế hoạch triển khai V1

Mọi sprint đều theo cùng một khung 10 phần: mục tiêu → khái niệm → công việc → file → test → kiểm tra thủ công → acceptance → bài tập troubleshooting → câu hỏi ôn tập → checkpoint commit.

Sprint V1.1 được viết đầy đủ chi tiết. Các sprint sau ở đây mới ở mức dàn ý và sẽ **được viết chi tiết khi bắt đầu từng sprint**, dựa trên những gì ta học được ở sprint trước.

Quy tắc: ta **dừng lại ở cuối mỗi sprint**. Sprint tiếp theo chỉ bắt đầu sau khi acceptance criteria đã được kiểm chứng và bạn xác nhận.

---

## Sprint V1.1 — Workspace foundations

### 1. Mục tiêu học tập
- Giải thích monorepo là gì và pnpm workspaces làm gì.
- Giải thích sự khác nhau giữa Docker **image**, **container** và **volume**, và chạy PostgreSQL trong một container.
- Giải thích vì sao `.env` bị git bỏ qua còn `.env.example` thì được commit.
- Kết nối tới PostgreSQL và chạy SQL bằng tay.
- Chứng minh dữ liệu vẫn còn sau khi restart container, và thấy nó biến mất khi xoá volume.

### 2. Khái niệm và điều kiện tiên quyết
Đọc trước khi code (ghi chú trong `docs/learning/`):
- [monorepo-and-pnpm-workspaces.md](../../learning/monorepo-and-pnpm-workspaces.md)
- [docker-fundamentals.md](../../learning/docker-fundamentals.md)
- [environment-variables-and-secrets.md](../../learning/environment-variables-and-secrets.md)

Điều kiện tiên quyết: Docker Desktop đã được cài và **đang chạy**. Có sẵn Node 24, pnpm 12 và git (đã kiểm tra trên máy này).

### 3. Các bước triển khai
1. Khởi tạo git; cấu hình line ending.
2. Tạo `package.json` ở thư mục gốc (workspace root dạng private, cố định package manager, engines, các script DB).
3. Tạo `pnpm-workspace.yaml` liệt kê `apps/*`.
4. Thêm `.gitignore`, `.gitattributes`, `.editorconfig`, `.node-version`.
5. Thêm `.env.example`. Copy nó thành `.env` trên máy local.
6. Thêm `docker-compose.yml` với một service duy nhất, `postgres`: image được cố định version, named volume, health check, port lấy từ env.
7. Thêm init script tạo database thứ hai, `pixelmart_test`, dành cho integration test (dùng từ V1.4).
8. Khởi động Postgres, kiểm tra health, chạy SQL và làm thí nghiệm về tính bền vững của dữ liệu.
9. Viết phần "Getting started (so far)" trong `README.md` ở thư mục gốc và điền bảng lệnh trong `docs/DEVELOPMENT.md` bằng các lệnh đã kiểm chứng.
10. Commit đầu tiên.

### 4. File cần tạo

| File | Trách nhiệm |
|---|---|
| `.gitignore` | Giữ `node_modules`, output của build, `.env*` (trừ `.env.example`) và các file rác của OS/editor ngoài git. |
| `.gitattributes` | Chuẩn hoá line ending về LF trong repo. Trên Windows, điều này giúp CRLF không làm hỏng shell script chạy trong Linux container sau này. |
| `.editorconfig` | Thống nhất thụt lề, charset và dòng trống cuối file giữa các editor. |
| `.node-version` | Ghi lại Node major (24) cho các công cụ quản lý version. |
| `package.json` | Workspace root: `"private": true`, `"packageManager": "pnpm@12.4.2"`, `engines`, các script `db:up`, `db:down`, `db:logs`, `db:psql`. |
| `pnpm-workspace.yaml` | Cho pnpm biết thư mục nào là workspace package (`apps/*`; `packages/*` chỉ thêm khi cần). |
| `.env.example` | Template có chú thích cho mọi biến, với giá trị **giả**. Được commit. |
| `.env` | Giá trị thật trên máy bạn. **Không bao giờ commit.** |
| `docker-compose.yml` | Hạ tầng local. Ở V1 chỉ có PostgreSQL. |
| `infra/docker/postgres/init/01-create-test-db.sql` | Chạy **một lần**, ở lần khởi động đầu tiên với volume trống. Tạo `pixelmart_test`. |
| `README.md` | Giới thiệu dự án và cách khởi động những gì đã có đến lúc này. |

Chưa tạo (chưa có lý do): `apps/`, `packages/`, `infra/nginx`, `.github/`.

### 5. Test cần viết và chạy
Chưa có code ứng dụng nên chưa có unit test. Việc kiểm chứng được làm bằng lệnh (mục 6). Health check là bước kiểm tra tự động đầu tiên của ta: Docker chạy `pg_isready` vài giây một lần và báo `healthy` hoặc `unhealthy`.

### 6. Kiểm tra thủ công
| Bước | Lệnh | Kết quả mong đợi |
|---|---|---|
| Toolchain | `node -v`, `pnpm -v`, `docker version` | v24.x, 12.4.x, có cả phần client + server (thiếu phần server ⇒ Docker Desktop chưa chạy) |
| Workspace hợp lệ | `pnpm install` | Chạy xong, tạo `pnpm-lock.yaml`, không lỗi |
| Khởi động DB | `pnpm db:up` rồi `docker compose ps` | `postgres` có trạng thái `healthy` (có thể hiện `starting` trong vài giây) |
| Kết nối | `pnpm db:psql` rồi `SELECT version();` | `PostgreSQL 18.x …` |
| DB test tồn tại | `\l` trong psql | Liệt kê `pixelmart` và `pixelmart_test` |
| Tính bền vững | Tạo một bảng và insert một dòng → `pnpm db:down` → `pnpm db:up` → `SELECT` | Dòng dữ liệu vẫn còn |
| Xoá volume | `docker compose down -v` → `pnpm db:up` → `SELECT` | Bảng biến mất (DB mới, init script đã chạy lại) |
| Secret không bị track | `git status` / `git check-ignore -v .env` | `.env` bị ignore. `.env.example` được track. |

### 7. Acceptance criteria
AC-1.1-01 … AC-1.1-07 trong [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md#sprint-v11--workspace-foundations).

### 8. Bài tập troubleshooting
1. **Xung đột port:** giả sử 5432 đã bị chiếm. Đổi `POSTGRES_PORT` thành 5433 trong `.env` rồi kết nối lại. Giải thích vì sao port phía container vẫn là 5432.
2. **Cái bẫy "đổi mật khẩu không có tác dụng":** đổi `POSTGRES_PASSWORD` trong `.env`, chạy `pnpm db:down && pnpm db:up`, rồi thử đăng nhập bằng mật khẩu mới qua TCP. Giải thích vì sao thất bại (init chỉ chạy khi thư mục dữ liệu trống) và hai cách khắc phục.
3. **Docker không chạy:** tắt Docker Desktop, chạy `pnpm db:up` và đọc lỗi. Tầng nào đã sinh ra lỗi đó?

### 9. Câu hỏi ôn tập
1. Tính năng workspace của pnpm mang lại gì mà hai thư mục riêng, mỗi thư mục một `package.json`, không có?
2. Image, container và volume: cái nào giữ dữ liệu của bạn, và cái nào bạn có thể xoá mà không mất dữ liệu?
3. Vì sao cần `.env.example` khi `.env` đã liệt kê đủ các biến?
4. Container ở trạng thái `running` khác gì với `healthy`?
5. Vì sao init script chỉ tạo `pixelmart_test` đúng một lần?

### 10. Checkpoint
`git commit -m "chore: initialize pnpm workspace and local PostgreSQL"`, sau đó cập nhật sprint log trong ROADMAP.

---

## Sprint V1.2 — NestJS API skeleton

- **Mục tiêu:** cơ bản về HTTP/REST, NestJS module / controller / provider / dependency injection, request lifecycle (middleware → guard → pipe → handler → interceptor → filter), cấu hình với env validation, log có cấu trúc.
- **Công việc:** scaffold `apps/api` bằng Nest 12 CLI. `ConfigModule` với env đã được validate (fail fast khi thiếu `DATABASE_URL`). `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`). Exception filter global trả về đúng định dạng lỗi đã thống nhất. nestjs-pino với request ID. Swagger tại `/docs`. `GET /health` (phần kiểm tra DB có ở V1.3). Script gốc `pnpm dev:api`.
- **File:** `apps/api/src/main.ts`, `app.module.ts`, `config/env.validation.ts`, `common/filters/http-exception.filter.ts`, `health/health.controller.ts`, `test/health.e2e-spec.ts`.
- **Test:** unit test cho định dạng output của exception filter. e2e test `GET /health → 200`. e2e test cho thấy route không tồn tại trả về định dạng lỗi chuẩn với `404`.
- **Kiểm chứng:** `curl -i localhost:4000/health`. Swagger UI tải được. Log là JSON có `reqId`. API từ chối khởi động khi thiếu env bắt buộc.
- **Bài tập troubleshooting:** xoá một env var bắt buộc và đọc lỗi khi khởi động. Gọi một route không tồn tại và lần ra thành phần nào đã trả về 404.
- **Docs:** tạo `docs/TESTING.md`, `docs/learning/http-and-rest.md`, `docs/learning/nestjs-fundamentals.md`.

## Sprint V1.3 — Database schema with Prisma

- **Mục tiêu:** mô hình hoá quan hệ, PK/FK, unique constraint, index, migration như một lịch sử có version, ORM so với raw SQL, vì sao tiền không dùng float, seeding.
- **Công việc:** cài `prisma@7.10.0`, `@prisma/client@7.10.0`, `@prisma/adapter-pg@7.10.0`. Tạo `prisma.config.ts` (file cấu hình của Prisma 7), `schema.prisma` với Category / Product / Order / OrderItem / User và các enum. Migration đầu tiên. Migration thứ hai tạo bằng `--create-only` chứa các CHECK constraint trong [DATABASE.md](../../DATABASE.md). `PrismaService` + `PrismaModule`. Seed idempotent (dùng upsert): 4 danh mục, ~24 sản phẩm (một số ở trạng thái DRAFT), 1 admin với mật khẩu đã hash lấy từ env. Health check giờ ping tới DB.
- **Test:** migration test áp dụng toàn bộ migration lên `pixelmart_test` từ đầu. Constraint test cho thấy việc insert giá âm và `line_total` không khớp bị từ chối ở tầng **database**. Chạy seed hai lần cho ra cùng số lượng bản ghi.
- **Kiểm chứng:** xem bảng trong psql (`\d products`). Mở Prisma Studio.
- **Bài tập troubleshooting:** sửa một file migration đã được áp dụng và quan sát lỗi checksum/drift. Giải thích vì sao migration đã áp dụng là bất biến.
- **Docs:** `docs/learning/relational-databases-and-postgresql.md`, `docs/learning/prisma-and-migrations.md`. Trạng thái của DATABASE.md → đã triển khai.

## Sprint V1.4 — Public catalog API

- **Mục tiêu:** thiết kế resource, query DTO, pagination, `select` so với over-fetching, N+1 problem, integration test với DB thật.
- **Công việc:** `CatalogModule` với `GET /categories`, `/categories/:slug`, `/products` (chỉ sản phẩm đã publish, lọc theo `category`, pagination), `/products/:slug`. Response DTO: tiền dưới dạng chuỗi. Swagger annotation. Ánh xạ lỗi Prisma → HTTP trong exception filter.
- **Test:** unit test cho phép tính pagination. Integration test (supertest + `pixelmart_test`) cho: sản phẩm draft không hiển thị, `pageSize=101` → 400, slug không tồn tại → 404, `totalPages` đúng.
- **Docs:** tạo `docs/API.md` (tổng quan + link tới Swagger). Viết `docs/learning/rest-api-design.md`.

## Sprint V1.5 — Storefront pages

- **Mục tiêu:** App Router, Server và Client Components, lấy dữ liệu phía server, `loading.tsx` / `error.tsx` / `not-found.tsx`, `next/image` và remote patterns, env var chỉ dùng phía server.
- **Công việc:** scaffold `apps/web` (Next 16, TS, Tailwind 4, App Router, `src/`). API client có kiểu dữ liệu trong `src/lib/api/`. Các trang: `/` (sản phẩm mới nhất), `/products/[slug]`, `/categories/[slug]` có pagination. Loading skeleton, empty state, error boundary. Script gốc `pnpm dev` chạy web + api cùng lúc.
- **Quyết định (ADR-0006):** kiểu dữ liệu API viết tay hay sinh ra từ OpenAPI. Mặc định: viết tay trước để bạn cảm nhận vấn đề lệch kiểu (drift), rồi chuyển sang sinh tự động ở V2.
- **Test:** unit test bằng Vitest cho hàm định dạng tiền. Kiểm tra thủ công từng state: tắt API → error state, danh mục rỗng → empty state.
- **Docs:** `docs/learning/nextjs-app-router-and-rendering.md`.

## Sprint V1.6 — Shopping cart

- **Mục tiêu:** client state, `useReducer` + Context, lưu bền vững bằng localStorage, lỗi hydration mismatch, thiết kế để dễ thay thế.
- **Công việc:** `features/cart/` với một `cartReducer` thuần (add, setQuantity, remove, clear) và một interface `CartStore` đứng trước implementation `LocalStorageCartStore`, để V2 có thể thay bằng cart phía server. Trang cart và badge trên header. Giới hạn số lượng 1–99 giống backend (chỉ phục vụ UX).
- **Test:** unit test cho reducer (thêm cùng một sản phẩm hai lần thì gộp lại, số lượng 0 thì xoá, tối đa 99). Test rằng giá trị localStorage bị hỏng được reset an toàn.
- **Các hạn chế được ghi lại:** chỉ trên từng thiết bị, mất khi xoá dữ liệu trình duyệt, người dùng sửa được (nên server không bao giờ tin), không có reservation tồn kho, giá hiển thị có thể đã cũ.

## Sprint V1.7 — Checkout and order creation

- **Mục tiêu:** không bao giờ tin client, tính giá phía server, DB transaction và ACID, tính toán bằng Decimal, mã lỗi mà UI có thể dựa vào để xử lý.
- **Công việc:** `OrdersModule`: `CreateOrderDto` (chỉ gồm các trường thông tin khách hàng + items `{productId, quantity}`). `OrdersService.create`: gộp các mục trùng → lấy các sản phẩm đã publish → 422 nếu thiếu sản phẩm nào → tính toán bằng Decimal → `prisma.$transaction` tạo order + items → thử lại khi trùng mã đơn hàng. `GET /orders/:orderNumber/summary` (không có PII). Web: form checkout (Server Action), lỗi theo từng trường, vô hiệu hoá nút submit khi đang xử lý, trang xác nhận, xoá cart khi thành công.
- **Test:** unit test cho bộ tính tổng tiền (bao gồm `0.10 × 3`). Integration test: giá bị sửa trong request body bị bỏ qua (và bị `forbidNonWhitelisted` từ chối); sản phẩm chưa publish → 422; số lượng 0 → 400; **một lỗi được cố ý gây ra khi insert item sẽ rollback cả dòng order** (sau đó có 0 đơn hàng).
- **Docs:** `docs/learning/transactions-and-acid.md`. Ghi lại lỗ hổng gửi trùng và kế hoạch cho V2.

## Sprint V1.8 — Admin authentication and authorization

- **Mục tiêu:** authentication và authorization, hash mật khẩu (argon2id), JWT là gì và không là gì, httpOnly cookie, guard, role, 401 và 403.
- **Công việc:** `AuthModule`: `POST /auth/login` (so sánh constant-time thông qua argon2 verify, thông báo lỗi chung chung), JWT (TTL ngắn, ví dụ 1h), `JwtAuthGuard`, `RolesGuard` + `@Roles('ADMIN')`, `GET /auth/me`. Web: Server Action ở `/admin/login` đặt một httpOnly cookie. `proxy.ts` chuyển hướng các request `/admin/*` chưa đăng nhập về trang login. Logout xoá cookie.
- **Quyết định (ADR-0007):** admin auth của V1 = JWT stateless trong httpOnly cookie trên origin của web. Hạn chế đã biết: không thu hồi được phía server trước khi hết hạn, sẽ xem lại ở V2.
- **Test:** không có token → 401. Token hợp lệ nhưng role không phải admin → 403. Token hết hạn/bị sửa → 401. Sai mật khẩu và email không tồn tại trả về **cùng một** response.
- **Cố ý làm trước admin CRUD**, để không bao giờ có admin write endpoint nào tồn tại mà không được bảo vệ.

## Sprint V1.9 — Admin catalog management

- **Công việc:** các endpoint `/admin/categories` và `/admin/products` (tất cả đều có guard). Sinh slug + kiểm tra unique → 409. Xoá danh mục còn sản phẩm → 409. Bật/tắt trạng thái sản phẩm. Validate image URL (https, độ dài). Admin UI: bảng có pagination, form tạo/sửa hiển thị lỗi từ server, xác nhận trước khi xoá.
- **Test:** integration test cho mọi trường hợp 409. Publish làm sản phẩm xuất hiện trong `/products` public; unpublish làm nó ẩn đi. Mọi route admin không có token → 401 (một test tham số hoá chạy qua danh sách route).

## Sprint V1.10 — Admin order management

- **Công việc:** danh sách `/admin/orders` (lọc theo trạng thái, pagination, mới nhất trước), trang chi tiết có dữ liệu khách hàng và snapshot của item, endpoint chuyển trạng thái tuân theo state machine. Admin UI cho danh sách/chi tiết/chuyển trạng thái.
- **Test:** một test dạng bảng (table-driven) cho mọi chuyển trạng thái được phép và bị cấm. Đổi tên sản phẩm sau khi đặt hàng không làm thay đổi `productName` của đơn hàng (chứng minh snapshot).

## Sprint V1.11 — V1 release

- **Công việc:** chạy thử từ một bản clone mới, chỉ làm theo README. Chạy toàn bộ test suite. Đi qua từng acceptance criterion kèm bằng chứng. Lấp các chỗ còn thiếu. Viết retrospective cho V1 (danh sách tech debt). Gắn tag `v1.0.0`.
- **Sản phẩm bàn giao:** V1 chỉ được đánh dấu ✅ trong ROADMAP khi mọi tiêu chí của V1 đã được kiểm chứng.
