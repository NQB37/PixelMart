# Design — Lộ trình học PixelMart v1 → v8

- Ngày: 2026-10-09 · Jira: PXM-45 · Trạng thái: **Approved (thiết kế)**, chờ review spec
- Vai trò Claude: tech lead + giảng viên

## 1. Mục tiêu

Học viên hoàn thành lộ trình sẽ có:
1. **Sản phẩm hoàn chỉnh:** nền tảng **multi-vendor e-commerce** gồm web (storefront, admin, seller) + mobile (Expo), chạy production trên domain thật.
2. **Kiến thức vững** về: Redis, Nginx, RabbitMQ, Kafka, Docker, Kubernetes, GitHub Actions, Jenkins, Prometheus, Grafana, microservices. Học viên phải hiểu được *vì sao* cần từng thứ, không chỉ biết *cách* dùng.

### Ràng buộc đã chốt

| Chủ đề | Quyết định |
|---|---|
| Multi-vendor | v1 giữ single-store. Multi-vendor bắt đầu ở v2 |
| Mức chi tiết plan | Hướng dẫn kỹ thuật, **không đưa lời giải**. Code đầy đủ chỉ cho config/boilerplate |
| Hạ tầng | PaaS (v1–v2) → VPS tự dựng thủ công (v3–v6) → k3s (v7–v8). Coolify chỉ xuất hiện trong knowledge base |
| Domain | Dùng domain đã mua, DNS qua Cloudflare, mỗi thành phần một subdomain |
| Lịch | Không ràng buộc ngày. Chỉ chia theo version/sprint/điểm. Sprint vẫn là 2 tuần, ~9–10 pts |

## 2. Nguyên tắc sư phạm

1. **Problem-first:** công nghệ chỉ xuất hiện khi sản phẩm gặp đúng bài toán của nó. Mỗi version mở đầu bằng một tình huống thực tế.
2. **Đo trước, tối ưu sau:** monitoring (v4) đi trước hoặc cùng lúc với caching để chứng minh hiệu quả bằng số liệu.
3. **Mỗi lần đổi một biến:** học K8s trên ứng dụng đã quen (v7), rồi mới đổi kiến trúc sang microservices trên platform đã quen (v8).
4. **Xen kẽ product/infra** để giữ động lực.
5. **Thủ công trước, tự động hóa sau:** tự viết `nginx.conf` trước khi dùng Ingress; tự deploy qua SSH trước khi dùng Jenkins/Helm.

## 3. Lộ trình

| Ver | Chủ đề | Bài toán | Công nghệ chính | ~Sprint | Sprint # |
|---|---|---|---|---|---|
| v1 | MVP single-store | Bán hàng end-to-end | NestJS monolith, Docker cơ bản, GH Actions, Render/Vercel/Neon, Sentry | 7 | 1–7 |
| v2 | Marketplace multi-vendor | Seller onboarding, tồn kho theo vendor, giỏ nhiều shop, tách đơn theo vendor, hoa hồng, review | Modular monolith, RBAC + ownership, domain modeling. Không thêm infra | 5 | 8–12 |
| v3 | Self-host | Chi phí/giới hạn PaaS, muốn kiểm soát hạ tầng | Docker chuyên sâu, Compose prod, Nginx (TLS, upstream 2 replica, gzip, rate limit), Postgres tự host + backup, GH Actions → GHCR → SSH deploy | 3 | 13–15 |
| v4 | Performance & Observability | Flash sale chậm, oversell | Prometheus + Grafana + Alertmanager (đo trước), k6, Redis (cache-aside, rate limit phân tán, giữ tồn kho atomic bằng Lua) | 3 | 16–18 |
| v5 | Async processing | Checkout chậm vì gửi email, đơn chưa thanh toán phải tự hủy | RabbitMQ: worker, retry, DLQ, delayed message, idempotent consumer, transactional outbox | 3 | 19–21 |
| v6 | Mobile app | Mua hàng trên điện thoại, push notification | Expo, tái dùng `contracts`/`api-client`, push qua worker RabbitMQ | 4 | 22–25 |
| v7 | Kubernetes & Jenkins | Một VPS + compose không scale, không có staging | k3s (k3d local), Deployment/Service/Ingress-NGINX/HPA/probe, Helm, cert-manager, kube-prometheus-stack. Jenkins trên K8s (pod agent) làm CD staging → prod có bước approve. GH Actions giữ vai trò CI cho PR | 4 | 26–29 |
| v8 | Microservices & Kafka | Tải và team tăng, cần tách module | Strangler fig: notification, search (read model/CQRS), analytics, payment mock + saga. Kafka làm event backbone (so sánh với RabbitMQ). OpenTelemetry tracing, API gateway | 5 | 30–34 |

- **Release:** sprint cuối của version N → `vN.0.0`. Các sprint trước đó tăng minor từ version trước (v2: sprint 8–11 → `v1.1.0`–`v1.4.0`, sprint 12 → `v2.0.0`). Major = mốc lộ trình (ghi trong rule 01). Trong cùng một version lộ trình không được phá vỡ API.
- **Chi phí ước tính:** v1–v2 là 0đ. v3–v6 dùng VPS 8GB (~€7/tháng). v7–v8 dùng VPS ~16GB (~€15–20/tháng). Giá cụ thể kiểm tra lại khi viết v3.
- **Số sprint ở trên là ước lượng:** con số chính xác được chốt khi viết chi tiết từng version.

## 4. Cấu trúc thư mục

```
docs/
├── README.md            bản đồ lộ trình v1→v8, link version + knowledge
├── rules/               chung mọi version (giữ nguyên, chỉ sửa link)
├── adr/                 chung (tạo từ PXM-20)
├── retro/               chung: sprint-N.md, vN.md
├── knowledge/
│   ├── README.md        index + bảng "công nghệ ↔ version"
│   ├── _template.md
│   ├── docker, nginx, redis, rabbitmq, kafka, kubernetes, github-actions, jenkins,
│   │   prometheus, grafana, microservices   (.md)
│   └── phụ trợ: linux-vps, dns-tls, helm, k6, opentelemetry, paas-vs-self-host (.md)
└── vN/
    ├── README.md        tổng quan version
    ├── sprints/         sprint-NN.md (+ playbook.html ở v1)
    └── plans/           sprint-NN.md
```

- **Đánh số sprint liên tục toàn dự án** (v2 bắt đầu `sprint-08.md`). Mã ticket tạm `S8-01`. Jira key tiếp tục tăng (PXM-45 đã dùng cho chính ticket tái cấu trúc này).
- Di chuyển bằng `git mv` để giữ lịch sử.
- Cập nhật tham chiếu: `CLAUDE.md` (đường dẫn sprint; câu "phản biện yêu cầu vượt phạm vi v1" đổi thành "vượt phạm vi **version đang làm**"), `docs/rules/03` (epic v1), `playbook.html` (link `docs/sprints/`).
- File knowledge chỉ tạo ở version giới thiệu công nghệ đó lần đầu. Riêng v1 tạo `docker.md` và `github-actions.md`.

## 5. Templates

### 5.1 `docs/vN/README.md`
```
# vN — <Tên> · Release vN.0.0
## Vì sao có version này        (tình huống thật)
## Kiến trúc: trước → sau        (2 sơ đồ mermaid)
## Học xong bạn làm được         (5–8 outcome đo được)
## Kiến thức cần đọc trước       (link knowledge)
## Hạ tầng & chi phí
## Epics
## Lộ trình sprint               (Sprint | Version | Goal | Pts)
## Ngoài phạm vi
## Exit criteria                 (DoD cấp version)
## Mapping Jira
```

### 5.2 `docs/vN/sprints/sprint-NN.md`
Giữ đúng format sprint của v1: tiêu đề `# Sprint N — <Tên> · vX.Y.0 · N pts`, Sprint Goal, Học được, ticket (`### PXM-xx · Tên` hoặc `### S8-01 · Tên` khi chưa có Jira key; dòng `Type · Epic · pts · labels`; user story nếu là Story; scope bullet; AC checkbox). Thêm:
- `Rủi ro & thứ tự làm` ở đầu sprint
- `Ngoài phạm vi` cho ticket dễ bị hiểu nhầm
- Sprint từ v2 trở đi ghi `*draft*` và refine trước khi kéo vào sprint

### 5.3 `docs/vN/plans/sprint-NN.md`
```
# Plan Sprint N — <Goal>
> Link sprint · Cách dùng plan (đọc khái niệm → tự làm → mở hint khi kẹt)
## 0. Trước khi bắt đầu   kiến thức cần có, setup
## 1. Bức tranh tổng      sơ đồ thay đổi
## 2. Thứ tự & phụ thuộc
## 3. <Ticket>            (lặp)
### Khái niệm cần nắm
### Hướng tiếp cận        "làm gì", không phải "code gì"
### File dự kiến tạo/sửa
### Tự nghĩ test case trước   (đáp án tham khảo trong <details>)
### Gợi ý                 <details> Hint 1 hướng / Hint 2 API-khái niệm / Hint 3 pseudo-code-khung
### Bẫy thường gặp        triệu chứng → nguyên nhân → cách tránh
### Kiểm chứng AC         lệnh cụ thể
### Đọc thêm              docs chính thức
## 4. Tự kiểm tra cuối sprint   5–8 câu dạng phỏng vấn (đáp án gợi ý trong <details>)
## 5. Kịch bản demo
```
Quy tắc nội dung: code đầy đủ chỉ cho config/boilerplate (Dockerfile, compose, YAML CI, nginx.conf ở lần thứ 2 trở đi). Logic business/auth chỉ có pseudo-code ở Hint 3.

### 5.4 `docs/knowledge/<tech>.md`
```
# <Tech>
> TL;DR (3 dòng)
## 1. Nó là gì & giải quyết vấn đề gì
## 2. Mô hình tư duy
## 3. Lệnh / cấu hình hay dùng      (cheat sheet theo tình huống)
## 4. Dùng thế nào cho hiệu quả
## 5. Khi nào nên / không nên dùng  (+ so sánh lựa chọn khác)
## 6. Bẫy fresher/junior hay gặp    (Triệu chứng | Nguyên nhân | Cách sửa)
## 7. Debug nhanh
## 8. Trong PixelMart
## 9. Câu hỏi phỏng vấn hay gặp
## 10. Tài liệu chính thức
```

## 6. Thực hiện theo đợt (review sau mỗi đợt)

| Đợt | Nội dung |
|---|---|
| 1 | Tái cấu trúc + sửa link; `docs/README.md`; `docs/v1/README.md`; 7 plan v1; `knowledge/README.md`, `_template.md`, `docker.md`, `github-actions.md` |
| 2 | v2 (README, sprints 08–12, plans) |
| 3 | v3 + knowledge: nginx, linux-vps, dns-tls, paas-vs-self-host (+ bổ sung docker.md) |
| 4 | v4 + knowledge: prometheus, grafana, redis, k6 |
| 5 | v5 + knowledge: rabbitmq |
| 6 | v6 |
| 7 | v7 + knowledge: kubernetes, helm, jenkins |
| 8 | v8 + knowledge: kafka, microservices, opentelemetry |

- Ngôn ngữ: tiếng Việt, giữ thuật ngữ kỹ thuật bằng tiếng Anh.
- Mọi lệnh/API của thư viện phải được đối chiếu với docs chính thức (context7) khi viết.

## 7. Ngoài phạm vi
- Tạo ticket Jira cho v2+ (làm ở refinement trước mỗi version)
- Playbook HTML cho v2+
- Sửa code ứng dụng
