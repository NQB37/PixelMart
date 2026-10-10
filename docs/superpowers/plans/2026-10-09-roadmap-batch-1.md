# Roadmap Đợt 1 — Tái cấu trúc docs + v1 plans + knowledge nền — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển `docs/sprints/` thành `docs/v1/`, tạo bản đồ lộ trình, viết 7 plan hướng dẫn cho v1 và knowledge base nền (Docker, GitHub Actions).

**Architecture:** Chỉ có tài liệu Markdown. Phần "test" của mỗi task là các lệnh kiểm chứng: link không hỏng, đủ heading theo template, không có placeholder, không lộ lời giải cho logic auth/business.

**Tech Stack:** Markdown (GitHub-flavored), Mermaid, `<details>`, git, bash (Git Bash trên Windows).

**Spec:** `docs/superpowers/specs/2026-10-09-learning-roadmap-design.md`

**Thư mục làm việc:** worktree `E:\Code\pixelmart-docs` (bash: `/e/Code/pixelmart-docs`), branch `chore/PXM-45-docs-roadmap`.

## Global Constraints

- Tiếng Việt, giữ thuật ngữ kỹ thuật bằng tiếng Anh.
- Plan là hướng dẫn, **không có lời giải**. Code đầy đủ chỉ dành cho config/boilerplate (Dockerfile, compose, YAML CI, tsconfig/eslint). Logic auth/business (hash, JWT, refresh rotation, tính tiền, tạo đơn, idempotency) chỉ có pseudo-code ở Hint 3.
- Gợi ý luôn nằm trong `<details><summary>…</summary>` và có **một dòng trống** sau `</summary>` để Markdown bên trong render được trên GitHub.
- Đánh số sprint liên tục toàn dự án. v1 = sprint 01–07, giữ nguyên Jira key PXM-7…PXM-44.
- Mọi API/lệnh của thư viện (NestJS, Prisma, Next.js, TanStack, GitHub Actions, Docker, Turborepo, nestjs-pino, nestjs-zod, argon2, Zustand…) phải được đối chiếu docs hiện hành qua context7 trước khi đưa vào plan.
- Commit theo Conventional Commits, có `Refs: PXM-45` và trailer `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Không sửa nội dung AC trong file sprint v1. Chỉ di chuyển file và sửa link.

## Review Focus

1. **Link hỏng sau khi di chuyển:** mọi link tương đối trong `docs/**/*.md`, `CLAUDE.md`, `AGENTS.md` phải trỏ tới file có thật. Kiểm tra bằng script ở Task 1, Step 4, chạy lại ở Task 6.
2. **Hint lộ lời giải:** Hint 3 của ticket auth/business không được chứa code TypeScript chạy được. Kiểm tra bằng grep ở mỗi task plan và đọc lại bằng mắt.
3. **`<details>` không render:** thiếu dòng trống sau `</summary>`. Kiểm tra bằng grep ở Task 6.
4. **Lệch giữa plan và sprint:** plan phải có đúng tập ticket key với file sprint tương ứng. Kiểm tra bằng script so khớp ở Task 6.
5. **API thư viện lỗi thời:** đối chiếu context7 trong từng task plan (bước "Verify APIs").

## Lệnh kiểm chứng dùng chung

Các task dưới đây gọi các lệnh này theo tên. Trước Task 1, lưu cả 4 lệnh thành hàm `check_links`, `check_plan <file>`, `check_keys <NN>`, `check_no_placeholder <file>` trong `C:/Users/nquoc/AppData/Local/Temp/claude/E--Code-pixelmart/94b6b978-edf2-479e-8c41-074611dcc6e7/scratchpad/checks.sh` (cuối file có dòng `"$@"`). Gọi bằng `bash <scratchpad>/checks.sh check_plan docs/v1/plans/sprint-01.md`. Script này không commit vào repo.

**CHECK-LINKS:** in ra mọi link tương đối bị hỏng. Kết quả mong đợi: không in gì.
```bash
cd /e/Code/pixelmart-docs && { git ls-files '*.md'; git ls-files -o --exclude-standard '*.md'; } | sort -u | while read f; do
  grep -oE '\]\([^)]+\)' "$f" | sed -E 's/^\]\(//; s/\)$//; s/#.*$//; s/ .*$//' | grep -vE '^(https?:|mailto:|$)' | while read l; do
    [ -e "$(dirname "$f")/$l" ] || echo "BROKEN $f -> $l"; done; done
```

**CHECK-PLAN `<file>`:** kiểm tra đủ heading theo template plan. Mong đợi: mọi dòng `OK`.
```bash
f=$1; for h in '^## 0\. Trước khi bắt đầu' '^## 1\. Bức tranh tổng' '^## 2\. Thứ tự & phụ thuộc' '^### Khái niệm cần nắm' '^### Hướng tiếp cận' '^### File dự kiến tạo/sửa' '^### Tự nghĩ test case trước' '^### Gợi ý' '^### Bẫy thường gặp' '^### Kiểm chứng AC' '^### Đọc thêm' '^## 4\. Tự kiểm tra cuối sprint' '^## 5\. Kịch bản demo'; do grep -qE "$h" "$f" && echo "OK $h" || echo "MISSING $h"; done
```

**CHECK-KEYS `<NN>`:** ticket key trong plan phải khớp với sprint. Mong đợi: không có output từ `diff`.
```bash
cd /e/Code/pixelmart-docs/docs/v1 && diff <(grep -oE '^### PXM-[0-9]+' sprints/sprint-$1.md | grep -oE 'PXM-[0-9]+') <(grep -oE '^## 3\.[0-9]+ PXM-[0-9]+' plans/sprint-$1.md | grep -oE 'PXM-[0-9]+')
```
(Mỗi ticket trong plan có heading `## 3.<i> PXM-xx · <Tên>`.)

**CHECK-NO-PLACEHOLDER `<file>`:** mong đợi không in gì.
```bash
grep -nE 'TBD|TODO|FIXME|lorem|\.\.\.\s*$' "$1"
```

---

### Task 1: Tái cấu trúc thư mục + sửa tham chiếu

**Files:**
- Move: `docs/sprints/*` → `docs/v1/sprints/` (sprint-01..07.md, playbook.html)
- Move: `docs/sprints/README.md` → `docs/v1/README.md` (viết lại ở Task 2)
- Modify: `CLAUDE.md` (dòng 3; mục "Vai trò của Claude")
- Modify: `docs/v1/sprints/playbook.html` (chuỗi `docs/sprints/` ở khoảng dòng 4966)
- Modify: `docs/rules/03-jira-workflow.md` (đoạn "Epic dự kiến cho v1")

**Interfaces:**
- Produces: đường dẫn `docs/v1/README.md`, `docs/v1/sprints/sprint-0N.md`, `docs/v1/plans/` (thư mục rỗng, tạo ở Task 4)

- [ ] **Step 1: Di chuyển bằng git mv**
```bash
cd /e/Code/pixelmart-docs && mkdir -p docs/v1 && git mv docs/sprints docs/v1/sprints && git mv docs/v1/sprints/README.md docs/v1/README.md && ls docs/v1 docs/v1/sprints
```
Mong đợi: `README.md  sprints` và `playbook.html sprint-01.md … sprint-07.md`.

- [ ] **Step 2: Sửa CLAUDE.md**
  - Dòng 3: `kế hoạch sprint trong \`docs/sprints/\`.` → `lộ trình học v1 → v8 trong \`docs/README.md\` (mỗi version: \`docs/vN/{sprints,plans}\`), sổ tay kiến thức trong \`docs/knowledge/\`.`
  - Mục "Vai trò của Claude", gạch đầu dòng thứ 3: `- Phản biện mọi yêu cầu vượt phạm vi v1 (Stripe, R2, variants, inventory, Redis, queue, microservices…).` → `- Phản biện mọi yêu cầu vượt phạm vi **version đang làm** (xem "Ngoài phạm vi" trong \`docs/vN/README.md\`). Ví dụ: đang ở v1 mà muốn thêm Redis/queue → nhắc rằng nó thuộc v4/v5.`
  - Thêm gạch đầu dòng: `- Khi viết plan/knowledge: plan là hướng dẫn, không có lời giải cho logic auth/business (xem rule 05).`

- [ ] **Step 3: Sửa playbook.html và rules/03**
  - `playbook.html`: thay `<code>docs/sprints/</code>` bằng `<code>docs/v1/</code>`.
  - `rules/03`: dòng `Epic dự kiến cho v1 (khớp với roadmap):` và dòng epic bên dưới → `Epic của từng version nằm trong \`docs/vN/README.md\`. Ví dụ v1:` theo sau là `` `Platform & DevOps` · `Identity & Auth` · `Catalog` · `Storefront & Cart` · `Checkout & Orders` · `Release v1.0` `` (khớp tên epic thật trên Jira).

- [ ] **Step 4: Kiểm chứng**
```bash
cd /e/Code/pixelmart-docs && grep -rn "docs/sprints" --include=*.md --include=*.html . ; echo "exit=$?"
```
Mong đợi: không có dòng nào khớp, `exit=1`. Sau đó chạy **CHECK-LINKS**. Link trong `docs/v1/README.md` tới `sprint-0N.md` sẽ bị báo hỏng, đây là kết quả mong đợi và được sửa ở Task 2.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "docs: move v1 sprints under docs/v1

Prepares a per-version docs layout for the v1-v8 learning roadmap.

Refs: PXM-45"
```

---

### Task 2: Bản đồ lộ trình `docs/README.md` + tổng quan `docs/v1/README.md`

**Files:**
- Create: `docs/README.md`
- Rewrite: `docs/v1/README.md` (giữ nguyên dữ liệu: Jira link, epics, lịch dự kiến, capacity, bảng sprint, mapping Jira, đoạn "Thay đổi so với blueprint")

**Interfaces:**
- Consumes: layout từ Task 1
- Produces: `docs/README.md` có anchor bảng lộ trình. Các version sau sẽ thêm hàng vào bảng này

- [ ] **Step 1: Viết `docs/README.md`**, gồm các mục:
  1. `# PixelMart — Lộ trình học`: 2–3 câu mục tiêu (copy từ spec §1).
  2. `## Cách dùng bộ tài liệu`: thứ tự đọc (version README → sprint → plan → knowledge khi cần), link `rules/`, `knowledge/`.
  3. `## Lộ trình`: bảng 8 hàng (Ver | Chủ đề | Bài toán | Công nghệ chính | Sprint # | Trạng thái). Cột trạng thái: v1 `Đang làm`, v2–v8 `Chưa viết`. Chỉ hàng v1 có link `[v1](v1/README.md)`, các hàng khác ghi tên version không có link (để CHECK-LINKS không báo lỗi).
  4. `## Nguyên tắc sư phạm`: 5 nguyên tắc từ spec §2.
  5. `## Hạ tầng qua các version`: sơ đồ Mermaid `flowchart LR` PaaS (v1–v2) → VPS + Compose + Nginx (v3–v6) → k3s (v7–v8), kèm chi phí ước tính.
  6. `## Công nghệ ↔ version`: bảng 11 công nghệ (Redis v4, Nginx v3, RabbitMQ v5, Kafka v8, Docker v1→v3→v7, K8s v7, GH Actions v1→, Jenkins v7, Prometheus v4, Grafana v4, Microservices v8), link tới `knowledge/README.md`.
  7. `## Quy ước`: đánh số sprint liên tục, tag `vN.0.0`, sprint draft refine trước khi kéo vào.

- [ ] **Step 2: Viết lại `docs/v1/README.md` theo template spec §5.1**
  - `# v1 — MVP single-store · Release v1.0.0`
  - "Vì sao có version này": tình huống chủ shop nhỏ cần bán hàng online. Mục tiêu học là nắm vững nền tảng full-stack và quy trình làm việc chuyên nghiệp trước khi học infra.
  - "Kiến trúc: trước → sau": trước = không có gì. Sau = Mermaid `flowchart` gồm web (Vercel), admin (Vercel), api (Render, Docker), Neon Postgres, Sentry, GitHub Actions.
  - "Học xong bạn làm được": 6–8 outcome, ví dụ "tự dựng monorepo Turborepo có cache", "viết refresh token rotation có reuse detection", "pipeline CI chặn merge khi test fail", "deploy tự động lên domain thật".
  - "Kiến thức cần đọc trước": link `../knowledge/docker.md`, `../knowledge/github-actions.md`.
  - "Hạ tầng & chi phí": Render free, Vercel hobby, Neon free, Sentry dev = 0đ. Lưu ý Render free có cold start.
  - "Epics", "Lộ trình sprint": giữ nguyên từ README cũ. Cột Sprint đổi thành link `sprints/sprint-0N.md` và thêm cột Plan link `plans/sprint-0N.md`.
  - "Ngoài phạm vi": Stripe, R2/upload ảnh, variants, inventory, multi-vendor (v2), Redis (v4), queue (v5), mobile (v6), K8s (v7), microservices (v8).
  - "Exit criteria": DoD cấp release từ rule 06 + tag `v1.0.0`.
  - "Mapping Jira": giữ nguyên bảng cũ. Giữ đoạn "Thay đổi so với blueprint" và "Quy ước trong các file sprint".
  - Câu "lập backlog v1.1 (mobile)" trong sprint-07 **không sửa** (theo Global Constraints). Thay vào đó thêm ghi chú trong README v1: "Mobile được dời sang v6 theo lộ trình mới. PXM-44 lập backlog cho v2 thay vì v1.1."

- [ ] **Step 3: Kiểm chứng**: chạy **CHECK-LINKS** và **CHECK-NO-PLACEHOLDER** cho cả 2 file. Link tới `plans/sprint-0N.md` sẽ còn báo hỏng cho tới khi xong Task 4–5. Chỉ chấp nhận các dòng BROKEN trỏ tới `plans/` và `../knowledge/`.

- [ ] **Step 4: Commit**: `docs: add roadmap index and v1 overview` (body: `Refs: PXM-45`).

---

### Task 3: Knowledge base nền: README, template, docker, github-actions

**Files:**
- Create: `docs/knowledge/README.md`, `docs/knowledge/_template.md`, `docs/knowledge/docker.md`, `docs/knowledge/github-actions.md`

**Interfaces:**
- Produces: `_template.md` có đúng 10 heading theo spec §5.4. Các file knowledge sau này copy từ template này

- [ ] **Step 1: `_template.md`**: 10 heading của spec §5.4, mỗi heading có 1 dòng chú thích dạng HTML comment `<!-- … -->` hướng dẫn nội dung.
- [ ] **Step 2: `README.md`**: mục đích (tra cứu nhanh, không thay docs chính thức), cách đọc, bảng tất cả công nghệ dự kiến (17 file theo spec §4) với cột: File | Học ở version | Trạng thái. Chỉ link file đã tồn tại.
- [ ] **Step 3: Verify APIs**: dùng context7 tra docs Docker (multi-stage, BuildKit cache mount, `docker init`, compose spec) và GitHub Actions (`actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, `concurrency`, `services`, cache, `GITHUB_TOKEN` permissions) để lấy version action và cú pháp hiện hành.
- [ ] **Step 4: `docker.md`**: đủ 10 mục. Nội dung bắt buộc:
  - Mô hình tư duy: image vs container vs layer vs registry. Build context. Sơ đồ layer cache.
  - Cheat sheet: build/run/exec/logs/ps/images/prune, `docker compose up -d --build`, `logs -f`, `down -v` (cảnh báo mất data), `docker buildx`, `docker history`, `dive`.
  - Hiệu quả: multi-stage, thứ tự layer (copy lockfile trước), `.dockerignore`, non-root user, pin base image, `turbo prune --docker` cho monorepo, healthcheck.
  - Nên/không nên: so với chạy trực tiếp trên host, so với VM.
  - Bẫy (≥ 8): `latest` tag, secret trong layer/`ARG`, `localhost` trong container, mất data khi `down -v`, image nặng vì copy `node_modules`, CRLF trong entrypoint trên Windows, PID 1 không nhận signal, chạy root, cache bị phá vì `COPY . .` sớm.
  - Trong PixelMart: v1 (PXM-11), v3 (compose prod), v7 (image cho K8s).
- [ ] **Step 5: `github-actions.md`**: đủ 10 mục. Nội dung bắt buộc:
  - Mô hình: workflow → job → step, runner, event trigger, `needs`, matrix, artifact vs cache, secrets vs vars, environments.
  - Cheat sheet YAML: trigger PR/push, concurrency cancel, pnpm + Turborepo cache, Postgres `services`, chỉ chạy job trên `main`, `workflow_dispatch`. Thêm lệnh `gh run list/watch/view --log-failed`, `act` để chạy local.
  - Hiệu quả: fail fast, cache đúng key, pin action theo SHA hoặc major version, `permissions` tối thiểu, tách CI/CD.
  - Nên/không nên: so với Jenkins (link sang `jenkins.md` sau, ghi là "v7").
  - Bẫy (≥ 8): secret không có trên PR từ fork, `pull_request_target` nguy hiểm, cache key sai luôn miss, required check đặt theo tên job, path filter làm required check bị treo, `GITHUB_TOKEN` thiếu quyền, timezone cron là UTC, echo secret ra log.
  - Trong PixelMart: PXM-12, PXM-13, PXM-15, PXM-19. v3 deploy SSH, v7 kết hợp Jenkins.
- [ ] **Step 6: Kiểm chứng**
```bash
cd /e/Code/pixelmart-docs/docs/knowledge && for f in docker.md github-actions.md; do echo "== $f"; for i in 1 2 3 4 5 6 7 8 9 10; do grep -qE "^## $i\. " $f && echo "OK $i" || echo "MISSING $i"; done; done
```
Mong đợi: 20 dòng OK. Chạy **CHECK-NO-PLACEHOLDER** cho từng file.
- [ ] **Step 7: Commit**: `docs(knowledge): add knowledge base with docker and github-actions` (`Refs: PXM-45`).

---

### Task 4: Plan Sprint 1 và Sprint 2 (nền tảng & data layer)

**Files:**
- Create: `docs/v1/plans/sprint-01.md`, `docs/v1/plans/sprint-02.md`

**Interfaces:**
- Consumes: `docs/v1/sprints/sprint-01.md`, `sprint-02.md`, `docs/knowledge/docker.md`, `github-actions.md`
- Produces: format heading `## 3.<i> PXM-xx · <Tên>` (các plan sau dùng y hệt)

Khung mỗi plan (áp dụng cho Task 4 và Task 5):
```
# Plan Sprint N — <Tên> · vX.Y.0
> Sprint: [sprint-0N.md](../sprints/sprint-0N.md) · Cách dùng: đọc "Khái niệm" → tự làm → kẹt > 30' mới mở Hint 1, rồi mới tới Hint 2, Hint 3.
## 0. Trước khi bắt đầu
## 1. Bức tranh tổng            (Mermaid)
## 2. Thứ tự & phụ thuộc
## 3.1 PXM-xx · <Tên>
### Khái niệm cần nắm
### Hướng tiếp cận
### File dự kiến tạo/sửa
### Tự nghĩ test case trước     (<details><summary>Đáp án tham khảo</summary>)
### Gợi ý                       (3 khối <details>: Hint 1 / Hint 2 / Hint 3)
### Bẫy thường gặp              (bảng Triệu chứng | Nguyên nhân | Cách tránh)
### Kiểm chứng AC               (mỗi AC ↔ 1 lệnh/cách kiểm)
### Đọc thêm
## 4. Tự kiểm tra cuối sprint    (5–8 câu, đáp án gợi ý trong <details>)
## 5. Kịch bản demo
```

- [ ] **Step 1: Verify APIs** qua context7: pnpm workspaces, Turborepo `turbo.json` (`tasks`, `dependsOn`, `outputs`, `turbo prune`), NestJS bootstrap + `setGlobalPrefix`, nestjs-pino, Next.js App Router, Render deploy hook, Vercel monorepo + `turbo-ignore`, Prisma migrate (`migrate dev` / `migrate deploy`, `directUrl`), nestjs-zod, `@nestjs/swagger`, Vite + TanStack Router file-based, Sentry SDK cho NestJS/Next/Vite và upload source map.
- [ ] **Step 2: Viết `sprint-01.md`** (7 ticket PXM-7…PXM-13). Điểm nhấn từng ticket:
  - PXM-7: rulesets vs branch protection cổ điển, GitHub for Jira, smart commits. Bẫy: quên đặt default branch là `develop`.
  - PXM-8: internal package (TS source) vs compiled package, `dependsOn: ["^build"]`, cache input/output. Bẫy: `outputs` sai nên không bao giờ cache hit, env không khai báo trong `turbo.json` làm cache sai. **Lưu ý:** học viên đang làm ticket này. Chỉ đưa hint, không đưa config hoàn chỉnh cho `turbo.json`.
  - PXM-9: fail-fast env bằng Zod, structured logging, correlation id. Hint 3 được phép có code cho schema env vì là boilerplate.
  - PXM-10: shared contract giữa FE/BE, Server Component fetch, xử lý lỗi khi API tắt.
  - PXM-11: multi-stage + `turbo prune --docker`, non-root. Được phép có Dockerfile mẫu đầy đủ trong Hint 3 **kèm giải thích từng dòng**, vì đây là lần đầu và rule 05 ở mức 4.
  - PXM-12: workflow YAML. Lần đầu tự viết nên Hint 3 chỉ có khung job + tên step, không có YAML hoàn chỉnh (rule 05: "Workflow GitHub Actions lần đầu" → tự làm).
  - PXM-13: deploy hook, DNS CNAME/A, `turbo-ignore`. Bẫy: secret deploy hook bị lộ, chạy deploy trước khi CI xong.
  - Mục 4: câu hỏi về cache Turborepo, khác biệt image/container, vì sao deploy hook thay vì auto-deploy.
- [ ] **Step 3: Viết `sprint-02.md`** (7 ticket PXM-14…PXM-20). Điểm nhấn:
  - PXM-14: UUIDv7 sinh ở app, migration workflow, seed idempotent (upsert), chiến lược DB cho integration test (truncate). Bẫy: `migrate dev` trên production, pooled vs direct URL của Neon.
  - PXM-15: thứ tự migrate trước deploy, expand/contract để tương thích ngược.
  - PXM-16: RFC 9457 fields (`type`, `title`, `status`, `detail`, `instance`), global filter, không lộ stack.
  - PXM-17: OpenAPI từ Zod.
  - PXM-18: file-based routing, dev proxy, SPA rewrite trên Vercel (bẫy: reload route con bị 404).
  - PXM-19: release = git SHA, source map upload, không public source map.
  - PXM-20: cấu trúc ADR, viết Alternatives một cách trung thực.
- [ ] **Step 4: Kiểm chứng**: với `01` và `02`, chạy **CHECK-PLAN**, **CHECK-KEYS**, **CHECK-NO-PLACEHOLDER**. Mong đợi: tất cả OK, không có diff, không có output.
- [ ] **Step 5: Commit**: `docs(v1): add plans for sprint 1-2` (`Refs: PXM-45`).

---

### Task 5: Plan Sprint 3 và Sprint 4 (auth)

**Files:** Create `docs/v1/plans/sprint-03.md`, `docs/v1/plans/sprint-04.md` (khung như Task 4)

- [ ] **Step 1: Verify APIs**: argon2 (node), `@nestjs/jwt`, `@nestjs/throttler` (cú pháp v6+ với `ThrottlerModule.forRoot([{ ttl, limit }])`), cookie-parser, NestJS Guards/Reflector, React Hook Form + zodResolver, Next.js middleware/`cookies()`, TanStack Router `beforeLoad`.
- [ ] **Step 2: Viết `sprint-03.md`** (PXM-21…25). **Đây là logic auth, Hint 3 chỉ được có pseudo-code.**
  - PXM-21: hashing vs encryption, vì sao argon2id, normalize email, không trả `passwordHash` (dùng response schema).
  - PXM-22: JWT structure, access ngắn/refresh dài, chỉ lưu hash của refresh token, thuộc tính cookie (giải thích từng cái), user enumeration, timing attack (vẫn chạy verify khi email không tồn tại).
  - PXM-23: rotation + family + reuse detection. Bắt buộc có **sơ đồ sequence Mermaid kịch bản kẻ tấn công**. Race condition khi 2 tab refresh cùng lúc.
  - PXM-24: Guard order, `@Public()`/`@Roles()` + Reflector, 401 vs 403.
  - PXM-25: CORS không phải cơ chế bảo vệ server, CSRF với SameSite=Lax, vì sao bắt buộc JSON content-type.
  - Thêm nhắc chạy `/security-review` cho mọi PR trong sprint.
- [ ] **Step 3: Viết `sprint-04.md`** (PXM-26…30). Điểm nhấn: dùng chung schema form/API; SSR đọc cookie; silent refresh **single-flight** (sơ đồ sequence; Hint 3 là pseudo-code); slug unique + hậu tố; `onDelete: Restrict` và map lỗi Prisma P2003/P2002 sang 409; phân trang offset vs cursor (giải thích vì sao v1 chọn offset).
- [ ] **Step 4: Kiểm tra lời giải bị lộ**
```bash
cd /e/Code/pixelmart-docs/docs/v1/plans && grep -nE 'argon2\.(hash|verify)\(|jwtService\.sign|\$transaction\(|createHash\(' sprint-03.md sprint-04.md
```
Mong đợi: không có kết quả nào nằm trong code block TypeScript. Nếu có, đổi sang pseudo-code. Sau đó chạy **CHECK-PLAN**, **CHECK-KEYS** (`03`, `04`), **CHECK-NO-PLACEHOLDER**.
- [ ] **Step 5: Commit**: `docs(v1): add plans for sprint 3-4` (`Refs: PXM-45`).

---

### Task 6: Plan Sprint 5–7 + kiểm chứng toàn bộ đợt

**Files:** Create `docs/v1/plans/sprint-05.md`, `sprint-06.md`, `sprint-07.md` (khung như Task 4)

- [ ] **Step 1: Verify APIs**: TanStack Table (manual pagination), TanStack Query (invalidate), Next.js `revalidate`/ISR, `generateMetadata`, `next/image` `remotePatterns`, Zustand `persist` + hydration, Prisma interactive transaction, helmet, Lighthouse.
- [ ] **Step 2: `sprint-05.md`** (PXM-31…35): server-side pagination có state trên URL, invalidate vs optimistic update, chuyển giá `199.00` → minor units không dùng float (bẫy `0.1+0.2`; dùng parse chuỗi), RSC vs client component, ISR và giới hạn của nó, `next/image` với URL tùy ý (ADR-0007).
- [ ] **Step 3: `sprint-06.md`** (PXM-36…39). **Logic business, Hint 3 chỉ có pseudo-code.** Hydration mismatch với persist; server tự tính giá (không tin client); snapshot `OrderItem`; Ports & Adapters cho `PaymentProvider`; idempotency key (sơ đồ sequence, race 2 request đồng thời, unique constraint làm hàng rào cuối); IDOR và vì sao trả 404.
- [ ] **Step 4: `sprint-07.md`** (PXM-40…44): state machine (bảng chuyển trạng thái, update có điều kiện `WHERE status='PENDING'` để tránh race), security headers checklist, Lighthouse, README "người lạ chạy được", release lớn + retro tổng. PXM-44: ghi chú backlog chuyển sang v2 (theo README v1).
- [ ] **Step 5: Kiểm chứng toàn đợt**
```bash
S=/c/Users/nquoc/AppData/Local/Temp/claude/E--Code-pixelmart/94b6b978-edf2-479e-8c41-074611dcc6e7/scratchpad/checks.sh
cd /e/Code/pixelmart-docs && for n in 01 02 03 04 05 06 07; do echo "== $n"; bash $S check_plan docs/v1/plans/sprint-$n.md | grep MISSING; bash $S check_keys $n; done
```
(Mong đợi: chỉ in ra các dòng `== NN`.) Chạy **CHECK-KEYS** cho `01`–`07`, **CHECK-LINKS** (mong đợi: không có output), **CHECK-NO-PLACEHOLDER** cho mọi file mới. Kiểm `<details>`:
```bash
cd /e/Code/pixelmart-docs/docs && grep -rn -A1 '</summary>' v1/plans knowledge | grep -vE '</summary>|^--$' | grep -vE '^\S+-[0-9]+-\s*$'
```
Mong đợi: không in gì (dòng sau `</summary>` luôn rỗng). Lặp lại grep lộ lời giải ở Task 5 Step 4 cho `sprint-06.md`.
- [ ] **Step 6: Cập nhật `docs/README.md`**: hàng v1 → `Plans: ✅`. Cập nhật `knowledge/README.md` cho trạng thái docker/github-actions.
- [ ] **Step 7: Commit**: `docs(v1): add plans for sprint 5-7` (`Refs: PXM-45`).
- [ ] **Step 8: Báo cáo** cho người dùng review đợt 1 (chưa push, chưa mở PR cho tới khi người dùng đồng ý).
