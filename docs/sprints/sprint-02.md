# Sprint 2 — Data layer & Admin shell · v0.2.0 · 10 pts

**Sprint Goal:** API kết nối Neon qua Prisma với **migration tự động trong pipeline**; `admin.<domain>` online; lỗi API chuẩn hóa (RFC 9457) và được theo dõi bằng Sentry.

**Học được:** Prisma migration workflow, test với DB thật, global pipe/filter trong NestJS, Problem Details, OpenAPI, Vite + TanStack Router, observability.

---

### PXM-14 · Prisma + Neon + model Store
`Task` · Platform & DevOps · **2 pts** · `api` `db`

- Prisma trong `apps/api`, `PrismaService` (lifecycle hooks)
- Model `Store` (id UUIDv7 sinh ở app, name, slug unique); seed 1 store "PixelMart"
- Chiến lược DB cho integration test: DB riêng, truncate giữa các test file

**AC**
- [ ] `pnpm db:migrate` và `pnpm db:seed` chạy được; seed chạy 2 lần không tạo trùng
- [ ] CI có Postgres service, integration test chạy với DB thật

### PXM-15 · Migration trong pipeline deploy
`Task` · Platform & DevOps · **1 pt** · `devops` `db`

- Step `prisma migrate deploy` (Neon direct URL) chạy **trước** khi gọi Render deploy hook

**AC**
- [ ] Migration lỗi → job fail, API **không** được deploy
- [ ] Migration thành công → schema mới có trên Neon trước khi API mới khởi động

### PXM-16 · Error handling RFC 9457 + Zod validation
`Task` · Platform & DevOps · **2 pts** · `api` `contracts`

- `ZodValidationPipe` global (`nestjs-zod`)
- Exception filter global → `application/problem+json`
- `packages/contracts/common/problem-details.ts`; `api-client` ném `ApiError` có type

**AC**
- [ ] Body sai → 400 với `errors[]` chứa đường dẫn field
- [ ] Lỗi không lường trước → 500, **không** lộ stack trace, log có `reqId`
- [ ] Integration test cho 400 và 404

### PXM-17 · OpenAPI docs
`Task` · Platform & DevOps · **1 pt** · `api`

- Sinh OpenAPI từ Zod DTO; Swagger UI tại `/v1/docs`

**AC**
- [ ] `/v1/docs` liệt kê `/v1/health` với schema response đúng

### PXM-18 · Admin app skeleton + deploy
`Task` · Platform & DevOps · **2 pts** · `admin`

- `apps/admin`: Vite + React + TanStack Router (file-based) + TanStack Query + Tailwind + shadcn
- Layout sidebar; route placeholder: `/login`, `/`, `/categories`, `/products`, `/orders`
- Vercel project thứ 2 → `admin.<domain>`; Vite dev proxy `/v1` → `localhost:3000`

**AC**
- [ ] `admin.<domain>` hiển thị layout, điều hướng giữa các route
- [ ] Route sai → trang 404 của admin

### PXM-19 · Sentry cho api/web/admin
`Task` · Platform & DevOps · **1 pt** · `devops`

- DSN qua env; `release` = git SHA; upload source maps trong CI

**AC**
- [ ] Lỗi thử từ mỗi app xuất hiện trên Sentry với đúng release và stack trace đọc được

### PXM-20 · ADR 0001–0005
`Task` · Platform & DevOps · **1 pt** · `docs`

- 0001 Monorepo pnpm + Turborepo · 0002 NestJS · 0003 REST + Zod contracts · 0004 Hosting & GitFlow rút gọn · 0005 Error format RFC 9457

**AC**
- [ ] Mỗi ADR có: Context, Decision, Alternatives, Consequences
