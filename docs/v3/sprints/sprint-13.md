# Sprint 13 — Self-host Foundation · v2.1.0 · 10 pts · *draft*

**Sprint Goal:** Toàn bộ PixelMart (web, admin, seller, API ×2, Postgres) chạy trên VPS bằng một file Compose, sau một Nginx tự viết, truy cập được qua HTTPS ở các hostname preview `next-*.<domain>`. Production vẫn ở PaaS.

**Học được:** hardening VPS Linux, image production cho Next.js và SPA, "build once, deploy anywhere", Compose production, reverse proxy và load balancing bằng Nginx, TLS qua Cloudflare.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S13-02. Giá trị `NEXT_PUBLIC_*`/`VITE_*` bị "đóng băng" vào bundle lúc build. Nếu không xử lý, image build cho preview sẽ gọi nhầm API khi chạy production. Quyết định cách làm (ADR-0010) **trước** khi viết Dockerfile.
- Thứ tự: S13-01 → S13-02 → S13-03 → S13-04 → S13-05. S13-01 làm song song được với S13-02 (một bên trên VPS, một bên ở máy local).
- Làm cho stack chạy **ở local trước** (`docker compose -f compose.prod.yaml up` trên máy bạn), rồi mới đưa lên VPS. Debug ở local nhanh hơn nhiều.
- Trong sprint này VPS được cập nhật **bằng tay** (copy file, `docker compose up`). Deploy tự động là việc của sprint 14.

---

### S13-01 · VPS: tạo máy + hardening + Docker
`Task` · Self-host Foundation · **2 pts** · `devops` `security`

- Tạo VPS Hetzner Cloud: x86, ~8 GB RAM, Ubuntu 24.04 LTS, **có IPv4**, đăng nhập bằng SSH key ngay từ lúc tạo.
- Hardening: user `deploy` có sudo, tắt đăng nhập root và đăng nhập bằng mật khẩu qua SSH, cài cập nhật bảo mật tự động, đặt timezone UTC, thêm swap.
- Firewall: **Hetzner Cloud Firewall** (nằm ngoài VM) chỉ mở 22, 80, 443. Hiểu vì sao UFW một mình không đủ khi chạy Docker.
- Cài Docker Engine + Compose plugin từ repo chính thức của Docker (không dùng bản snap). Cấu hình xoay log mặc định cho Docker.
- Ghi lại mọi lệnh đã chạy. Claude viết thành runbook `docs/runbooks/vps-setup.md` từ ghi chú của bạn.

**AC**
- [ ] `ssh root@<ip>` bị từ chối. SSH bằng mật khẩu bị từ chối. `ssh deploy@<ip>` bằng key thành công
- [ ] Quét port từ một máy **bên ngoài** VPS: chỉ thấy 22 (80/443 chưa có dịch vụ nào nghe)
- [ ] User `deploy` chạy được `docker run --rm hello-world`. Reboot VPS → Docker tự khởi động lại
- [ ] `/etc/docker/daemon.json` có giới hạn kích thước log
- [ ] Runbook đủ chi tiết để dựng lại một VPS mới từ đầu

**Ngoài phạm vi:** VPN/bastion (Tailscale, WireGuard). Fail2ban là tùy chọn. Ansible/Terraform (tự động hóa provisioning để sau).

### S13-02 · Image production cho web + cấu hình lúc chạy (runtime config)
`Task` · Self-host Foundation · **2 pts** · `devops` `web` `admin` `seller`

- `apps/web`: Next.js `output: 'standalone'`, Dockerfile multi-stage (dùng `turbo prune` như API ở v1), chạy bằng user non-root, có `HEALTHCHECK`.
- Nguyên tắc **build once, deploy anywhere:** một image dùng được cho cả preview lẫn production, chỉ khác biến môi trường lúc chạy. Áp dụng cho web, admin, seller (admin/seller được đóng gói ở S13-04).
- Chọn cách đưa cấu hình phụ thuộc môi trường (URL API, Sentry DSN/environment…) vào lúc chạy, không phải lúc build. ADR-0010: Runtime config cho frontend.
- Kiểm tra lại image API của v1: build cho `linux/amd64`, kích thước, user non-root, healthcheck.

**AC**
- [ ] Cùng một image web, chạy với hai bộ env khác nhau → trang gọi đúng hai URL API khác nhau (xem Network tab)
- [ ] `grep` URL API production trong bundle JS của image → không tìm thấy (không bị hardcode lúc build)
- [ ] Container web chạy bằng user khác root (`docker exec … id`), `HEALTHCHECK` chuyển `healthy`
- [ ] Image web < 300 MB. Ghi lại kích thước image web và API trong mô tả PR
- [ ] ADR-0010 so sánh ít nhất 2 cách làm runtime config và lý do chọn

**Ngoài phạm vi:** build image trong CI và push registry (S14-01).

### S13-03 · Compose production
`Task` · Self-host Foundation · **2 pts** · `devops` `db`

- `compose.prod.yaml` (tách khỏi compose dev của v1): `postgres`, `api-1`, `api-2`, `web`, `edge`.
- Mạng: Postgres, API, web nằm trong mạng nội bộ. **Chỉ `edge` publish port** (80, 443).
- Postgres: named volume, phiên bản major khớp (hoặc mới hơn) với Neon đang dùng, không publish port ra host.
- Mỗi service: `healthcheck`, `restart` policy, giới hạn bộ nhớ, `depends_on` theo trạng thái healthy.
- Secret nằm trong file `.env` trên VPS (quyền `600`, không commit). `.env.example` cho production liệt kê đủ biến.
- Pool kết nối Prisma × số replica API không vượt `max_connections` của Postgres.

**AC**
- [ ] `docker compose -f compose.prod.yaml up -d` trên máy sạch → mọi service `healthy`, chạy migration + seed được
- [ ] Từ máy ngoài VPS: không kết nối được port 5432 và 3000
- [ ] `docker compose down && up -d` → dữ liệu Postgres còn nguyên
- [ ] Process API chết đột ngột (kill PID của container từ host, xem plan) → container tự khởi động lại
- [ ] `docker compose config` không in ra secret thật nào trong repo

**Ngoài phạm vi:** backup (S14-04). Tuning Postgres chuyên sâu (v4, khi có số liệu).

### S13-04 · Nginx edge: routing theo host, load balancing, static SPA
`Task` · Self-host Foundation · **3 pts** · `devops` `api` `admin` `seller`

- Image `edge` (Nginx chính thức) build multi-stage: build `apps/admin` và `apps/seller` thành file tĩnh, copy vào image cùng cấu hình Nginx.
- Server block theo host:
  - `api.`: reverse proxy tới `api-1`/`api-2` (upstream, keepalive, timeout hợp lý).
  - `shop.`: reverse proxy tới `web`. `/_next/static/` cache dài hạn.
  - `admin.`, `seller.`: phục vụ file tĩnh, **SPA fallback** về `index.html`, asset có hash cache dài hạn, `index.html` không cache.
- Default server: host lạ (truy cập thẳng bằng IP, domain khác) → đóng kết nối, không trả nội dung PixelMart.
- Header proxy đầy đủ (`Host`, `X-Forwarded-For`, `X-Forwarded-Proto`). API cấu hình `trust proxy` đúng số lớp proxy để `req.ip` và cookie `Secure` hoạt động.
- gzip cho text/JSON. Access log có `request_time` và `upstream_addr`.
- Hostname điều khiển bằng biến môi trường (dùng được cho cả `next-*` lẫn hostname production).

**AC**
- [ ] Gọi `/v1/health` 20 lần qua `edge` → access log cho thấy request chia đều cho cả hai API
- [ ] Dừng `api-1` → request vẫn thành công qua `api-2` (không có 502 kéo dài)
- [ ] `admin.` và `seller.`: reload ở route con (ví dụ `/products/123`) → không 404
- [ ] `curl -I` một asset có hash → `Cache-Control` dài hạn + `immutable`. `index.html` → `no-cache`
- [ ] `curl -H "Host: lạ.example" http://<ip>` → không nhận nội dung PixelMart
- [ ] Chạy ở local (chưa qua Cloudflare): log API ghi đúng IP client, không phải IP của container `edge`
- [ ] `nginx -t` chạy trong CI hoặc trong bước build image

**Ngoài phạm vi:** rate limit, IP thật từ Cloudflare, security headers (S14-03).

### S13-05 · TLS qua Cloudflare + hostname preview
`Task` · Self-host Foundation · **1 pt** · `devops` `security`

- Cloudflare: tạo bản ghi DNS **proxied** cho `next-shop.`, `next-admin.`, `next-seller.`, `next-api.<domain>` → IP VPS.
- Tạo **Origin Certificate** (phủ `<domain>` và `*.<domain>`), gắn vào `edge`. Private key nằm trên VPS (quyền chặt), **không** nằm trong image và repo.
- SSL/TLS mode **Full (strict)**. Port 80 chỉ redirect sang HTTPS.
- `CORS_ORIGINS` và URL trong runtime config của stack VPS dùng hostname `next-*`.
- Đọc phần ACME/Let's Encrypt trong [dns-tls.md](../../knowledge/dns-tls.md) để biết cách làm khi không dùng Cloudflare.

**AC**
- [ ] Mở `https://next-shop.<domain>` → trình duyệt báo HTTPS hợp lệ. Đăng ký, đăng nhập, đặt một đơn trên stack VPS thành công
- [ ] Đổi SSL mode sang Full (strict) không gây lỗi 526
- [ ] `curl -vk https://<ip>` trả chứng chỉ Origin (không được trình duyệt tin), không phải nội dung PixelMart
- [ ] Không có file `.pem`/`.key` nào trong git (`git ls-files` kiểm tra)
- [ ] Production (`shop.<domain>`…) vẫn chạy trên PaaS, không bị ảnh hưởng

**Ngoài phạm vi:** chỉ cho phép IP Cloudflare vào 443, Authenticated Origin Pulls (S14-03).

---

## Release v2.1.0

Production vẫn ở PaaS. Release này mang các thay đổi trong code (Next.js `standalone`, runtime config, `trust proxy`) lên production hiện tại. **Kiểm tra trên production PaaS rằng không có gì hỏng**, đặc biệt là runtime config và cookie đăng nhập.
