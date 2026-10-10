# Sprint 14 — Delivery Pipeline & Data Safety · v2.2.0 · 10 pts · *draft*

**Sprint Goal:** Merge vào `main` là stack VPS (preview) tự cập nhật, API không downtime trong lúc rolling, rollback được trong vài phút. Dữ liệu Postgres trên VPS được backup off-site hằng đêm và đã restore thử thành công. Nginx chỉ nhận traffic từ Cloudflare, có rate limit theo IP thật.

**Học được:** container registry và tag image bất biến, deploy qua SSH an toàn, migration tương thích ngược khi chạy rolling update, rollback, real IP sau CDN, rate limit ở tầng proxy, chiến lược backup (3-2-1, RPO/RTO), restore drill.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S14-02. Trong lúc rolling, phiên bản API cũ và mới **cùng chạy** trên schema đã migrate. Migration phá vỡ tương thích sẽ làm phiên bản cũ lỗi giữa chừng. Ôn lại expand/contract ([plan Sprint 2 v1](../../v1/plans/sprint-02.md)).
- **Rủi ro thứ hai:** S14-03. Giới hạn 80/443 chỉ cho IP Cloudflare mà sai danh sách → khóa chính mình ra ngoài. Làm trên preview, có sẵn cách mở lại qua Hetzner Console.
- Thứ tự: S14-01 → S14-02 → S14-03. S14-04 độc lập, làm song song được từ đầu sprint.
- Pipeline PaaS của v2 **vẫn giữ nguyên**. Sprint này chỉ thêm pipeline VPS chạy song song.

---

### S14-01 · CI build và push image lên GHCR
`Task` · Delivery Pipeline · **2 pts** · `devops` `ci`

- Workflow build 3 image (`api`, `web`, `edge`) cho `linux/amd64`, push lên GHCR.
- Tag: `sha-<short-sha>` cho mọi build từ `develop` và `main`. Khi tạo tag release `vX.Y.Z` → **gắn thêm** tag đó cho image đã có, không build lại. Không deploy bằng tag `latest`.
- PR: build để kiểm tra Dockerfile, **không** push.
- Cache layer giữa các lần build (buildx cache).
- Label OCI (`org.opencontainers.image.source`, `revision`) để truy ngược image → commit.
- Upload source map lên Sentry từ CI (trước đây Vercel làm hộ). Token Sentry là secret của GitHub, chỉ đưa vào build qua **build secret**, không qua `build-arg` (image public, build-arg nằm lại trong lịch sử image).

**AC**
- [ ] Merge vào `develop` → 3 image xuất hiện trên GHCR với tag `sha-…` đúng commit
- [ ] `docker history --no-trunc` image web/edge không chứa token Sentry
- [ ] PR sửa Dockerfile sai cú pháp → CI đỏ, không có image nào được push
- [ ] Build lần 2 không đổi dependency nhanh hơn rõ rệt (ghi thời gian 2 lần vào mô tả PR)
- [ ] `docker pull` từ VPS thành công (package public, hoặc VPS có token chỉ đọc)
- [ ] Lỗi thử trên stack VPS hiện trên Sentry với stack trace đọc được

**Ngoài phạm vi:** ký image (cosign), quét lỗ hổng image (để backlog, có thể làm ở v7).

### S14-02 · Deploy qua SSH: migrate → rolling update → smoke test → rollback
`Task` · Delivery Pipeline · **3 pts** · `devops` `ci` `db`

- Job deploy chạy sau S14-01 khi push `main`, và chạy tay được bằng `workflow_dispatch` (build + deploy một ref, hoặc deploy lại một tag đã có để rollback). Dùng GitHub **Environment** riêng cho VPS (secret: SSH private key, host, `known_hosts`).
- Mọi thử nghiệm (migration lỗi, deploy liên tiếp, rollback) chạy bằng `workflow_dispatch` lên **VPS preview**. Không thử bằng cách merge vào `main`: trong sprint này `main` vẫn deploy PaaS và chạy migration trên Neon production, và theo [rule 01](../../rules/01-git-branching.md) `main` chỉ nhận PR release/hotfix.
- Script deploy nằm trong repo, chạy trên VPS với tham số là tag image:
  1. Pull image mới.
  2. Chạy migration bằng **container chạy một lần** (dùng image API, target riêng có Prisma CLI). Migration lỗi → dừng, phiên bản cũ vẫn phục vụ.
  3. Cập nhật **từng replica API một**, chờ healthy rồi mới sang replica tiếp theo. Sau đó cập nhật `web`, `edge` (một replica: chấp nhận gián đoạn vài giây, đo và ghi lại).
  4. Smoke test: `/v1/health` trả `version` đúng tag vừa deploy.
- Rollback: chạy lại script với tag của release trước. Ghi tag đang chạy vào một file trên VPS.
- Không cho hai deploy chạy chồng nhau (concurrency).
- Key SSH chỉ dùng cho deploy, user `deploy` không có mật khẩu sudo dùng được từ CI.

**AC**
- [ ] Trong pha rolling API, một vòng lặp gọi `https://next-api.<domain>/v1/health` mỗi 0,2 giây → không có response 5xx. Khoảng gián đoạn khi thay `edge`/`web` được đo (đính kèm log vào PR)
- [ ] Migration cố tình lỗi (branch thử, `workflow_dispatch` lên preview, **không** merge) → job đỏ, `/v1/health` vẫn trả version cũ
- [ ] Rollback về tag trước ≤ 5 phút từ lúc bắt đầu. Ghi thời gian thật
- [ ] Hai lần chạy deploy liên tiếp → lần thứ hai chờ lần thứ nhất xong
- [ ] Host key của VPS được kiểm tra (không dùng `StrictHostKeyChecking=no`)
- [ ] `docker image prune` trong script, ổ đĩa không đầy dần sau nhiều lần deploy

**Ngoài phạm vi:** blue/green toàn stack, canary (v7). Approval thủ công trước deploy (v7, Jenkins).

### S14-03 · Nginx hardening: chỉ nhận Cloudflare, IP thật, rate limit, security headers
`Task` · Delivery Pipeline · **2 pts** · `devops` `security`

- Firewall ngoài VM (hoặc `DOCKER-USER` nếu không có): 80/443 chỉ cho dải IP Cloudflare. Có script/quy trình cập nhật khi Cloudflare đổi dải IP.
- Nginx lấy IP client thật từ header của Cloudflare, **chỉ tin** header đó khi request đến từ IP Cloudflare.
- Rate limit ở Nginx cho các endpoint nhạy cảm (`/v1/auth/*`), theo IP thật, trả `429`. Thống nhất với `@nestjs/throttler` của API (ai chặn gì, ở đâu).
- Request SSR từ `web` gọi API không bị tính chung vào một "IP" (của container web).
- Security headers cho các host frontend (`X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`…). `client_max_body_size`, timeout hợp lý.

**AC**
- [ ] Từ một máy không phải Cloudflare: `curl https://<ip>` (và `--resolve`) → timeout
- [ ] Log Nginx và log API hiển thị IP thật của bạn (so với trang "what is my IP")
- [ ] Gửi header `CF-Connecting-IP` giả từ IP không phải Cloudflare → không được tin (test bằng cách tạm mở firewall cho IP của bạn, hoặc test ở local)
- [ ] 30 request login trong 1 phút từ một IP → nhận `429`. Khách khác cùng lúc vẫn đăng nhập được
- [ ] Trang sản phẩm SSR với 50 request liên tiếp không bị `429` do throttler của API
- [ ] securityheaders.com (hoặc `curl -I`) liệt kê đủ header đã chọn, ghi kết quả trong PR

**Ngoài phạm vi:** WAF rule trả phí, Authenticated Origin Pulls (tùy chọn, ghi chú trong plan). Rate limit phân tán bằng Redis (v4).

### S14-04 · Backup Postgres off-site + diễn tập restore
`Task` · Data Safety · **3 pts** · `devops` `db`

- Backup hằng đêm bằng `pg_dump` (định dạng custom), chạy bằng systemd timer (hoặc cron) trên VPS.
- Upload lên **Cloudflare R2** bằng API token loại **Object Read & Write** chỉ trên đúng một bucket (không dùng token Admin: nó sửa được bucket lock và lifecycle). File dump không bao giờ nằm trong repo.
- Bật **bucket lock** (retention) để backup mới không xóa được trong N ngày, kể cả khi token trên VPS bị lộ.
- Retention: giữ 7 bản hằng ngày + 4 bản hằng tuần (lifecycle rule của bucket hoặc script).
- **Dead man's switch:** backup không chạy hoặc lỗi → bạn nhận cảnh báo (ví dụ healthchecks.io free).
- **Restore drill:** tải bản backup mới nhất về, restore vào một Postgres tạm, so sánh số bản ghi các bảng chính và chạy báo cáo đối soát ledger (S12-04) trên dữ liệu restore.
- Đo **RPO** (tối đa mất bao nhiêu dữ liệu) và **RTO** (mất bao lâu để chạy lại). Claude viết `docs/runbooks/restore-postgres.md` từ ghi chú và số liệu của bạn.

**AC**
- [ ] Sau 2 đêm, R2 có ≥ 2 bản backup trong `daily/`, tên file có timestamp UTC
- [ ] Tắt timer (hoặc làm script lỗi) → nhận được cảnh báo trong vòng 1 ngày
- [ ] Restore drill thành công: số bản ghi các bảng chính khớp, đối soát ledger "khớp", ghi RTO đo được
- [ ] Thử xóa một backup còn trong thời gian lock bằng token trên VPS → bị từ chối
- [ ] Runbook restore đủ để một người khác làm theo mà không cần hỏi

**Ngoài phạm vi:** point-in-time recovery (WAL archiving, pgBackRest): backlog. Backup ảnh/file upload (PixelMart chưa có upload ảnh, xem "Ngoài phạm vi" của v2).

---

## Release v2.2.0

`main` giờ deploy tới **cả hai nơi**: PaaS (production, như cũ) và VPS (preview, pipeline mới). Kiểm tra cả hai sau khi release: production PaaS không bị ảnh hưởng, `next-*` chạy đúng commit của release (`/v1/health` trả `sha-…` của commit được tag `v2.2.0`).
