# PixelMart

Một nền tảng thương mại điện tử theo định hướng production, được xây dựng như một hành trình học tập dài hạn theo dự án (project-based learning): từ một MVP chạy local đến một hệ thống đã deploy, có observability và hướng event-driven.

**Stack:** Next.js · NestJS · PostgreSQL · Prisma · TypeScript, cùng với Docker, Nginx, Redis, RabbitMQ, Kafka, GitHub Actions, Prometheus/Grafana, Coolify và Kubernetes được đưa vào dần dần.

## Trạng thái

Sprint V1.1 (nền tảng workspace + PostgreSQL local) đã hoàn thành. Sprint tiếp theo: V1.2 — khung NestJS API. Xem [docs/ROADMAP.md](docs/ROADMAP.md).

## Tài liệu

Bắt đầu từ [docs/README.md](docs/README.md).

## Bắt đầu (đến V1.1)

Hiện tại repo mới có workspace và một database PostgreSQL chạy trong Docker. Chưa có API hay web.

**Cần có:** Node.js 24, pnpm 12 (phiên bản chính xác được ghim trong `package.json`), Git và Docker Desktop **đang chạy**. Chi tiết xem [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

```sh
git clone <repo-url> pixelmart
cd pixelmart
cp .env.example .env   # rồi sửa giá trị nếu cần; .env không bao giờ được commit
pnpm install
pnpm db:up             # khởi động PostgreSQL 18 và chờ đến khi healthy
pnpm db:psql           # mở psql bên trong container
```

Trong psql, chạy `SELECT version();` (phải hiện `PostgreSQL 18.x`) và `\l` (phải có `pixelmart` và `pixelmart_test`). Thoát bằng `\q`.

Dừng database bằng `pnpm db:down`. Dữ liệu vẫn được giữ trong Docker volume cho lần sau.
