# Sprint 1 — Foundation · v0.1.0 · 11 pts

**Sprint Goal:** Monorepo chạy được; API `/v1/health` và web hello-world **tự động deploy** lên `api.<domain>` / `shop.<domain>` khi merge vào `main`.

**Học được:** pnpm workspaces & Turborepo task graph, NestJS bootstrap, Docker multi-stage, GitHub Actions, deploy hook, DNS/subdomain, quản lý env/secret.

> ⚠️ Sprint rủi ro nhất (hơi vượt capacity). Ưu tiên **S1-02 → S1-03 → S1-06 → S1-07**. Nếu trễ, S1-05 (docker-compose) có thể dời.

---

### PXM-7 · Khởi tạo GitHub repo & quy tắc branch
`Task` · Platform & DevOps · **1 pt** · `devops`

- Repo **public** `pixelmart`; tạo `main`, `develop` (default branch = `develop`)
- Rulesets cho `main` & `develop` theo `docs/rules/01-git-branching.md`
- `.gitignore`, `.editorconfig`, `.nvmrc` (Node LTS), `.github/pull_request_template.md`
- Commit `docs/` hiện có; cài app **GitHub for Jira**

**AC**
- [ ] Push trực tiếp lên `develop`/`main` bị từ chối
- [ ] Mở PR tự hiện template
- [ ] Branch `feature/PXM-x-...` hiện trong Development panel của ticket Jira

### PXM-8 · Scaffold monorepo pnpm + Turborepo
`Task` · Platform & DevOps · **2 pts** · `devops`

- `pnpm-workspace.yaml`, `turbo.json` với task `build`, `dev`, `lint`, `typecheck`, `test`
- `packages/config`: tsconfig base (`strict: true`), ESLint flat config, Prettier
- `packages/contracts`, `packages/api-client` (khung rỗng, internal package dùng TS source)

**AC**
- [ ] `pnpm turbo lint typecheck build` từ root chạy xanh
- [ ] Chạy lần 2 hiển thị `FULL TURBO` (cache hit)
- [ ] Mọi app/package kế thừa tsconfig từ `packages/config`

### PXM-9 · NestJS API skeleton
`Task` · Platform & DevOps · **2 pts** · `api`

- `apps/api`, global prefix `/v1`, `GET /v1/health` → `{ status, version, uptime }`
- Validate env bằng Zod lúc boot (fail fast)
- `nestjs-pino`: log JSON, mỗi request có `reqId` (nhận `x-request-id` nếu client gửi)

**AC**
- [ ] Thiếu biến env bắt buộc → app không khởi động, log nêu rõ biến nào
- [ ] Mỗi dòng log của request chứa `reqId`
- [ ] `GET /v1/health` trả 200

### PXM-10 · Next.js web skeleton + contract đầu tiên
`Task` · Platform & DevOps · **1 pt** · `web`

- `apps/web` (App Router, Tailwind, `shadcn init`)
- `packages/contracts`: `healthResponseSchema`; `packages/api-client`: `getHealth()`
- Trang `/` (Server Component) hiển thị trạng thái API

**AC**
- [ ] Đổi tên field trong `healthResponseSchema` → `typecheck` lỗi ở **cả** `api` và `web`
- [ ] API tắt → trang `/` hiển thị trạng thái lỗi, không crash

### PXM-11 · Docker hóa API + docker-compose local
`Task` · Platform & DevOps · **1 pt** · `devops`

- `apps/api/Dockerfile` multi-stage (dùng `turbo prune`), chạy bằng user non-root
- `docker-compose.yml`: `postgres:16` (dùng từ Sprint 2) + `api`

**AC**
- [ ] `docker compose up` → `curl localhost:3000/v1/health` trả 200
- [ ] Image production < 300MB, không chứa devDependencies

### PXM-12 · CI pipeline (GitHub Actions)
`Task` · Platform & DevOps · **2 pts** · `devops`

- Trigger: PR + push `develop`/`main`; cache pnpm store & Turborepo
- Jobs: lint → typecheck → test → build → docker build
- Test đầu tiên: Vitest + Supertest gọi `GET /v1/health`
- Đặt job `ci` là required status check

**AC**
- [ ] PR có lỗi lint/test → không thể merge
- [ ] Pipeline trên PR xanh < 5 phút

### PXM-13 · CD production: Render + Vercel + DNS
`Task` · Platform & DevOps · **2 pts** · `devops`

- Render web service (Docker), tắt auto-deploy; GitHub Actions gọi **deploy hook** khi push `main`
- Vercel project cho `apps/web` (root directory, ignored build step bằng `turbo-ignore`)
- DNS: `api.<domain>` → Render, `shop.<domain>` → Vercel, HTTPS
- Thực hiện release đầu tiên theo `docs/rules/04-sprint-lifecycle.md`

**AC**
- [ ] Merge `develop → main` → cả 2 URL production cập nhật mà không thao tác tay
- [ ] Tag `v0.1.0` + GitHub Release
- [ ] Secrets chỉ nằm trong GitHub/Render/Vercel, không có trong repo
