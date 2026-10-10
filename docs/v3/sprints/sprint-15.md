# Sprint 15 — Cutover & Release v3.0 · v3.0.0 · 10 pts · *draft*

**Sprint Goal:** Production chuyển hẳn từ PaaS sang VPS: dữ liệu từ Neon sang Postgres tự host không mất một bản ghi, `shop.`, `admin.`, `seller.`, `api.<domain>` phục vụ từ VPS. PaaS được dọn. Phát hành `v3.0.0`.

**Học được:** lên kế hoạch migration có maintenance window, diễn tập trước khi làm thật, điểm go/no-go và điểm không quay lại được (point of no return), DNS TTL và cache, kiểm chứng dữ liệu sau khi chuyển, viết runbook vận hành.

## Rủi ro & thứ tự làm

- **Rủi ro lớn nhất:** S15-03. Đây là lần duy nhất trong v3 thao tác trực tiếp trên dữ liệu production. **Không được làm S15-03 nếu S15-02 chưa diễn tập thành công ít nhất một lần** trên bản sao dữ liệu thật.
- Thứ tự: S15-01 → S15-02 → S15-03 → S15-04 → S15-05.
- Chọn maintenance window lúc ít người dùng, thông báo trước. Chừa ít nhất một ngày giữa S15-02 và S15-03 để sửa những gì diễn tập phát hiện.
- Ghi chú lại **mọi** thời điểm và lệnh trong lúc cutover. Đó là nguyên liệu cho retro và runbook.

---

### S15-01 · Maintenance mode + uptime monitor
`Task` · Cutover · **2 pts** · `devops`

- Maintenance mode ở `edge`: bật/tắt bằng một file cờ (hoặc biến) trên VPS, **không cần build lại image**. Khi bật: mọi host trả trang bảo trì tĩnh, status `503` kèm `Retry-After`.
- Trong lúc bảo trì, bạn (người vận hành) vẫn kiểm tra được hệ thống thật (ví dụ cho phép IP của bạn, hoặc một header bí mật). Chọn cách và giải thích trong PR.
- Uptime monitor bên ngoài (dịch vụ free) cho 4 host, kiểm tra mỗi 1–5 phút, cảnh báo qua email hoặc chat. Monitor của API kiểm tra nội dung `/v1/health`, không chỉ status code.

**AC**
- [ ] Bật cờ → `curl -I https://next-shop.<domain>` trả `503` + `Retry-After`. Tắt cờ → trở lại bình thường, không restart container
- [ ] Trong lúc bảo trì, bạn vẫn vào được trang thật và gọi được API theo cách đã chọn
- [ ] Dừng `edge` 5 phút trên preview → nhận cảnh báo. Bật lại → nhận thông báo đã phục hồi
- [ ] Trang bảo trì không gọi tài nguyên nào từ app (không JS bundle, không gọi API)

**Ngoài phạm vi:** status page công khai. Alert theo metric (v4).

### S15-02 · Diễn tập cutover trên bản sao dữ liệu thật
`Task` · Cutover · **3 pts** · `devops` `db`

- Dump Neon (kết nối **direct**, không qua pooler) bằng `pg_dump` cùng hoặc mới hơn phiên bản server. Restore vào Postgres trên VPS (thay dữ liệu seed của preview).
- Xử lý khác biệt giữa Neon và Postgres tự host: owner/role, extension, quyền. Bảng `_prisma_migrations` đi cùng dữ liệu: sau restore, `prisma migrate status` báo "up to date".
- Kiểm chứng: số bản ghi các bảng chính, đối soát ledger (S12-04), đăng nhập bằng một tài khoản thật (hash mật khẩu dùng được), tạo đơn mới trên preview (sequence/ID không đụng nhau).
- **Bấm giờ** từng bước. Thời gian dump + restore + kiểm chứng = độ dài tối thiểu của maintenance window.
- Claude viết `docs/runbooks/cutover-v3.md` từ ghi chú của bạn: các bước có thời gian, điểm go/no-go, điểm không quay lại, cách rollback ở từng bước.

**AC**
- [ ] Diễn tập ít nhất 1 lần thành công từ đầu đến cuối theo runbook, có số liệu thời gian thật
- [ ] Bảng so sánh số bản ghi Neon ↔ VPS khớp 100% cho mọi bảng nghiệp vụ
- [ ] Đối soát ledger trên dữ liệu restore: "khớp"
- [ ] `prisma migrate status` trên VPS sau restore: không có migration nào pending hoặc lệch
- [ ] Runbook có mục rollback và tiêu chí go/no-go rõ ràng (ai quyết, dựa trên kiểm tra nào)

**Ngoài phạm vi:** migration không downtime bằng logical replication (ghi chú trong plan như một hướng nâng cao).

### S15-03 · Cutover production
`Task` · Cutover · **3 pts** · `devops` `db`

- Làm theo runbook của S15-02. Khung bước (chi tiết nằm trong runbook):
  1. Trước 24–48 giờ: hạ TTL của các bản ghi DNS production, thông báo maintenance window.
  2. Bật maintenance trên VPS, chuyển DNS production sang VPS (proxied), **chặn ghi** vào Neon từ phía PaaS.
  3. Dump Neon → restore VPS → kiểm chứng như diễn tập.
  4. Go/no-go. Go → đổi runtime config/`CORS_ORIGINS` sang hostname production (chỉ đổi env, cùng image), tắt maintenance.
  5. Theo dõi sát 24 giờ đầu (uptime monitor, Sentry, log).
- Rollback được định nghĩa trước: trước điểm không quay lại thì quay về PaaS. Sau điểm đó thì sửa tiến (fix forward) trên VPS.
- Neon chuyển sang chỉ đọc (hoặc dừng compute), **chưa xóa**.

**AC**
- [ ] `shop.`, `admin.`, `seller.`, `api.<domain>` phục vụ từ VPS. `curl -I` thấy header của Cloudflare, `/v1/health` trả version đúng tag
- [ ] Số bản ghi các bảng nghiệp vụ khớp giữa Neon (sau khi chặn ghi) và VPS. Đối soát ledger "khớp"
- [ ] Đăng nhập bằng tài khoản có từ trước cutover thành công. Một đơn mới end-to-end (khách → seller → nhận hàng) thành công trên production
- [ ] Thời gian bảo trì thực tế ≤ ước lượng từ diễn tập + 50%. Ghi lại thời gian thật
- [ ] Không có request ghi nào tới Neon sau thời điểm chặn ghi (kiểm tra log Render hoặc thống kê của Neon)

### S15-04 · Dọn PaaS + ADR self-host + so sánh chi phí
`Task` · Cutover · **1 pt** · `devops` `docs`

- Xóa job deploy Render/Vercel khỏi workflow. Pipeline VPS (S14-02) giờ là CD duy nhất cho production.
- Gỡ các hostname `next-*` (DNS, server block, `CORS_ORIGINS`).
- Render, Vercel: xóa service/project (hoặc gỡ domain trước, xóa sau N ngày). Neon: lưu một bản dump cuối lên R2, giữ project N ngày rồi xóa. N ghi trong ADR.
- ADR-0011: Self-host trên một VPS. Claude viết từ quyết định và số liệu của bạn: lý do, single point of failure được chấp nhận, RPO/RTO, chi phí trước/sau (số thật), điều kiện để chuyển sang K8s (v7).

**AC**
- [ ] Merge vào `main` chỉ deploy lên VPS, không còn gọi Render/Vercel
- [ ] Không còn bản ghi DNS, server block hay origin CORS nào chứa `next-`
- [ ] ADR-0011 có bảng chi phí PaaS ↔ VPS bằng số thực tế và ngày dọn Neon

### S15-05 · Runbook vận hành + Release v3.0.0 + retro
`Task` · Release v3.0 · **1 pt** · `devops` `docs`

- Bạn tự xử lý thử từng tình huống trên VPS (có thể dùng preview cũ hoặc giờ thấp điểm) và ghi lại lệnh. Claude viết thành `docs/runbooks/`:
  - API không phản hồi / container restart liên tục
  - Ổ đĩa đầy (log, image cũ, dump)
  - Restore Postgres (đã có từ S14-04, cập nhật nếu cần)
  - Xoay secret: JWT secret, mật khẩu Postgres, SSH key deploy, token R2
  - Gia hạn/đổi Origin Certificate
- Release theo checklist. Smoke test toàn luồng marketplace trên production.
- Retro sprint 15 và retro tổng v3. Lập backlog v4 (Performance & Observability).

**AC**
- [ ] Mỗi runbook có: dấu hiệu nhận biết, lệnh kiểm tra, cách xử lý, cách xác nhận đã hết lỗi
- [ ] Tag `v3.0.0`, GitHub Release có changelog
- [ ] `docs/retro/v3.md` đã có (kèm số liệu: thời gian bảo trì, RTO, chi phí), Epic v4 đã tạo trên Jira

---

## Release v3.0.0

Release đầu tiên chỉ deploy lên VPS. Không có thay đổi phá vỡ API (hostname, cookie, response giữ nguyên). Changelog ghi rõ thay đổi hạ tầng và đường dẫn tới ADR-0011.
