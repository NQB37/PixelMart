# Knowledge base: sổ tay tra cứu nhanh

Mỗi file trả lời cùng một bộ câu hỏi cho một công nghệ: **nó là gì, giải quyết vấn đề gì, lệnh hay dùng, dùng thế nào cho hiệu quả, khi nào nên và không nên dùng, bẫy hay gặp với fresher/junior, cách debug, câu hỏi phỏng vấn.**

## Cách dùng

- **Trước một version:** đọc các file được liệt kê trong mục "Kiến thức cần đọc trước" của `vN/README.md`. Đọc mục 1, 2 và 5 là đủ để bắt đầu.
- **Trong lúc làm:** dùng mục 3 (cheat sheet) và mục 7 (debug nhanh) để tra cứu.
- **Sau một sprint:** tự trả lời mục 9 (câu hỏi phỏng vấn) mà không nhìn đáp án. Trả lời không được tức là chưa hiểu, hãy đọc lại.
- Đây là **sổ tay**, không thay thế docs chính thức. Gặp chi tiết quan trọng (flag, phiên bản, cú pháp mới) thì luôn kiểm tra lại ở mục 10.

Muốn viết thêm file mới thì copy [`_template.md`](_template.md).

## Danh mục

| File | Chủ đề | Học ở version | Trạng thái |
|---|---|---|---|
| [docker.md](docker.md) | Container, image, Compose | v1 → v3 → v7 | ✅ |
| [github-actions.md](github-actions.md) | CI/CD trên GitHub | v1 → v8 | ✅ |
| `nginx.md` | Reverse proxy, TLS, load balancing | v3 | Chưa viết |
| `linux-vps.md` | SSH, user, firewall, systemd trên VPS | v3 | Chưa viết |
| `dns-tls.md` | DNS record, Cloudflare, Let's Encrypt | v3 | Chưa viết |
| `paas-vs-self-host.md` | Render/Vercel vs VPS vs Coolify | v3 | Chưa viết |
| `prometheus.md` | Metrics, PromQL, alerting | v4 | Chưa viết |
| `grafana.md` | Dashboard, đọc số liệu | v4 | Chưa viết |
| `redis.md` | Cache, rate limit, atomic ops | v4 | Chưa viết |
| `k6.md` | Load testing | v4 | Chưa viết |
| `rabbitmq.md` | Message queue, retry, DLQ | v5 | Chưa viết |
| `kubernetes.md` | Orchestration, k3s | v7 | Chưa viết |
| `helm.md` | Đóng gói manifest K8s | v7 | Chưa viết |
| `jenkins.md` | CI/CD tự host, pipeline as code | v7 | Chưa viết |
| `kafka.md` | Event streaming | v8 | Chưa viết |
| `microservices.md` | Tách service, saga, CQRS | v8 | Chưa viết |
| `opentelemetry.md` | Distributed tracing | v8 | Chưa viết |

> File chưa viết sẽ được thêm ở version giới thiệu công nghệ đó lần đầu (xem [lộ trình](../README.md)).
