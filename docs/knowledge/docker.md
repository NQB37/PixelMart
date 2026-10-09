# Docker

> **TL;DR:** Docker đóng gói ứng dụng cùng toàn bộ môi trường chạy (runtime, thư viện, file hệ thống) thành một **image**, rồi chạy image đó thành **container** cô lập, giống hệt nhau trên mọi máy. Nhờ vậy hết cảnh "máy em chạy được". PixelMart dùng Docker để đóng gói API từ v1 (PXM-11), chạy cả hệ thống bằng Compose trên VPS ở v3, và làm đơn vị deploy cho Kubernetes ở v7.

## 1. Nó là gì & giải quyết vấn đề gì

**Vấn đề:** API chạy tốt trên laptop (Node 24, Windows), lên server lại lỗi vì server có Node 20, thiếu thư viện hệ thống, sai biến môi trường. Muốn chạy Postgres để dev thì phải cài thẳng lên máy, version lệch với production.

**Docker giải quyết bằng cách:** đóng gói **mọi thứ ứng dụng cần** vào một image bất biến (immutable). Image chạy ở đâu cũng như nhau: laptop, CI, Render, VPS, Kubernetes.

**So sánh đời thường:** image giống **hộp cơm đã đóng gói sẵn** (công thức + nguyên liệu, niêm phong). Container là **một suất đang được ăn**: lấy từ cùng một loại hộp, nhiều người ăn cùng lúc, ai ăn phần người nấy.

**Container khác VM ở đâu?** VM giả lập cả một máy tính (có kernel riêng, nặng vài GB, khởi động mất cả phút). Container chỉ là **process bình thường trên host**, được kernel Linux cô lập bằng *namespaces* (process chỉ thấy file, mạng, PID của riêng nó) và giới hạn tài nguyên bằng *cgroups*. Nhờ vậy container nhẹ (MB) và khởi động trong vài giây. Trên Windows/macOS, Docker Desktop chạy một VM Linux nhỏ ở bên dưới.

## 2. Mô hình tư duy

| Khái niệm | Ý nghĩa |
|---|---|
| **Image** | Template chỉ đọc, gồm nhiều **layer** xếp chồng. Mỗi lệnh `RUN`/`COPY`/`ADD` trong Dockerfile tạo ra một layer |
| **Container** | Một instance đang chạy của image, có thêm một layer ghi được ở trên cùng. Container bị xóa thì layer ghi này **mất theo** |
| **Layer cache** | Khi build lại, Docker dùng lại layer cũ nếu lệnh và input của lệnh đó không đổi. **Một layer thay đổi thì mọi layer phía sau phải build lại** |
| **Build context** | Thư mục được gửi cho Docker khi build (thường là `.`). `.dockerignore` loại file khỏi context |
| **Registry** | Kho chứa image: Docker Hub, GitHub Container Registry (GHCR)… Image có tên dạng `ghcr.io/nqb37/pixelmart-api:1.4.0` |
| **Volume** | Nơi lưu dữ liệu **sống lâu hơn container**, ví dụ data Postgres |
| **Network** | Container trong cùng network gọi nhau bằng **tên service** (`postgres:5432`), không dùng `localhost` |
| **Multi-stage build** | Một Dockerfile có nhiều `FROM`. Stage build có đủ devDependencies, stage cuối chỉ copy kết quả cần để chạy, nên image nhỏ và an toàn hơn |

```
Dockerfile ──docker build──▶ Image (layers) ──docker push──▶ Registry
                                  │                              │
                          docker run                      docker pull (server)
                                  ▼                              ▼
                             Container ◀──── volume (data bền) ──┘
```

Cách layer cache hoạt động (thứ tự lệnh rất quan trọng):

```
COPY package.json pnpm-lock.yaml ./   ← ít thay đổi  → thường cache HIT
RUN pnpm install --frozen-lockfile    ← nặng nhất    → cache HIT nếu lockfile không đổi
COPY . .                              ← đổi mỗi lần sửa code
RUN pnpm build                        ← build lại, nhưng không phải cài lại deps
```

## 3. Lệnh / cấu hình hay dùng

**Image**

| Lệnh | Dùng khi |
|---|---|
| `docker build -t pixelmart-api:dev -f apps/api/Dockerfile .` | Build image (dấu `.` ở cuối là build context) |
| `docker images` / `docker image ls` | Xem các image đang có |
| `docker history pixelmart-api:dev` | Xem từng layer nặng bao nhiêu, để tìm thủ phạm làm image phình to |
| `docker image inspect <img>` | Xem config: user, env, entrypoint, label |
| `docker tag <img> ghcr.io/nqb37/pixelmart-api:0.1.0` + `docker push …` | Đẩy image lên registry |
| `docker buildx build --platform linux/amd64,linux/arm64 …` | Build image đa kiến trúc (VPS ARM, ví dụ Hetzner CAX) |

**Container**

| Lệnh | Dùng khi |
|---|---|
| `docker run --rm -p 3000:3000 --env-file .env pixelmart-api:dev` | Chạy thử. `--rm` tự xóa container khi dừng |
| `docker ps` / `docker ps -a` | Container đang chạy / tất cả, kể cả đã dừng |
| `docker logs -f --tail 100 <ctr>` | Xem log |
| `docker exec -it <ctr> sh` | Vào trong container để debug (image alpine dùng `sh`, không có `bash`) |
| `docker inspect <ctr>` | IP, mount, env, exit code, health |
| `docker stats` | CPU/RAM theo thời gian thực |
| `docker stop <ctr>` / `docker rm <ctr>` | Dừng / xóa |

**Docker Compose**

| Lệnh | Dùng khi |
|---|---|
| `docker compose up -d` | Khởi động mọi service ở chế độ nền |
| `docker compose up -d --build api` | Build lại rồi chạy riêng service `api` |
| `docker compose logs -f api` | Log của một service |
| `docker compose ps` | Trạng thái và health của các service |
| `docker compose exec postgres psql -U postgres` | Chạy lệnh trong service đang chạy |
| `docker compose down` | Dừng và xóa container + network. **Volume vẫn được giữ** |
| `docker compose down -v` | ⚠️ Xóa **cả volume**, tức là **mất toàn bộ data DB** |
| `docker compose config` | In ra config cuối cùng sau khi merge file và thay biến, để kiểm tra lỗi YAML/biến |

**Dọn dẹp**

| Lệnh | Ghi chú |
|---|---|
| `docker system df` | Xem Docker đang chiếm bao nhiêu dung lượng |
| `docker image prune` | Xóa image "dangling" (không có tag) |
| `docker builder prune` | Xóa build cache |
| `docker system prune` | Xóa container dừng, network thừa, image dangling. Thêm `--volumes` sẽ xóa cả volume, **cẩn thận** |

**Ví dụ `compose.yaml` cho dev (v1, PXM-11)**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: pixelmart
      POSTGRES_PASSWORD: pixelmart   # chỉ dùng cho local
      POSTGRES_DB: pixelmart
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pixelmart"]
      interval: 5s
      retries: 10

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    env_file: apps/api/.env
    environment:
      DATABASE_URL: postgresql://pixelmart:pixelmart@postgres:5432/pixelmart   # host là "postgres", không phải localhost
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

## 4. Dùng thế nào cho hiệu quả

1. **Multi-stage build.** Stage `build` có compiler và devDependencies, stage `runtime` chỉ có `node` + `dist` + production deps. Image nhỏ hơn (thường giảm từ ~1GB xuống ~200MB) và ít lỗ hổng hơn.
2. **Copy lockfile trước, source sau** để layer `install` được cache. Trong monorepo, dùng `turbo prune <app> --docker`: lệnh này tạo `out/json/` (chỉ các `package.json` + lockfile đã cắt gọn) và `out/full/` (source cần thiết). Copy `out/json` → install → copy `out/full` → build.
3. **`.dockerignore` luôn phải có:** `node_modules`, `.git`, `dist`, `.next`, `.turbo`, `.env*`, `coverage`. Thiếu file này thì build context có thể lên tới hàng trăm MB, build chậm, và **file `.env` có thể lọt vào image**.
4. **Chạy bằng user non-root.** Image `node` có sẵn user `node`, dùng `USER node`. Nếu container bị chiếm quyền, kẻ tấn công không phải root.
5. **Pin version base image** (`node:24-alpine` hoặc chính xác hơn `node:24.x.y-alpine`), đừng dùng `latest`. Build hôm nay và tháng sau phải ra cùng kết quả.
6. **Một container chỉ làm một việc** (API, worker, DB tách riêng). Dễ scale, dễ xem log, dễ restart.
7. **Cấu hình qua biến môi trường** (12-factor), không "nướng" secret vào image. Cùng một image phải chạy được ở dev/staging/prod.
8. **Có `HEALTHCHECK` hoặc healthcheck trong Compose/K8s** để orchestrator biết lúc nào app sẵn sàng thật sự, không chỉ là process đang sống.
9. **Dùng BuildKit cache mount** cho package manager để build lại nhanh hơn: `RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile`.
10. **Gắn tag image bằng version hoặc git SHA**, không ghi đè cùng một tag. Rollback khi đó chỉ là chạy lại tag cũ.

## 5. Khi nào nên / không nên dùng

**Nên dùng khi:**
- Cần môi trường giống nhau giữa dev, CI và production.
- Cần chạy dịch vụ phụ trợ khi dev (Postgres, Redis, RabbitMQ) mà không cài lên máy.
- Deploy lên nền tảng nhận container (Render, Fly, VPS, Kubernetes).

**Không nên / không cần khi:**
- Nền tảng đã tự build từ source tốt hơn: ví dụ Next.js trên Vercel. Ở v1 web/admin **không** cần Dockerfile.
- Script chạy một lần, công cụ CLI cá nhân.
- Dùng Docker để "đóng gói cho có" mà không hiểu volume/network: dễ mất dữ liệu.

| So sánh | Docker container | VM | Cài thẳng lên host | PaaS build từ source |
|---|---|---|---|---|
| Khởi động | giây | phút | — | — |
| Cô lập | process-level | toàn phần (kernel riêng) | không | do nền tảng lo |
| Tái lập môi trường | cao | cao | thấp | trung bình |
| Công vận hành | trung bình | cao | thấp lúc đầu, cao về sau | thấp nhất |

## 6. Bẫy fresher/junior hay gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| API trong container báo `ECONNREFUSED 127.0.0.1:5432` | Trong container, `localhost` là **chính container đó**, không phải máy host hay container DB | Dùng tên service (`postgres:5432`). Muốn gọi ra host thì dùng `host.docker.internal` |
| Chạy `docker compose down -v` xong mất sạch data | `-v` xóa named volume | Chỉ dùng `-v` khi cố ý reset DB. Production phải có backup |
| Image nặng 1–2GB | Copy cả `node_modules`, không multi-stage, giữ devDependencies | Multi-stage + `.dockerignore` + `turbo prune` + `pnpm deploy --prod` hoặc `pnpm install --prod` ở stage cuối |
| Sửa một dòng code mà phải cài lại toàn bộ dependencies | `COPY . .` đặt **trước** `RUN pnpm install` | Copy manifest/lockfile trước, install, rồi mới copy source |
| Secret xuất hiện khi chạy `docker history` | Truyền secret qua `ARG`/`ENV` hoặc `COPY .env` | Truyền secret lúc **chạy** (env của nền tảng). Nếu cần lúc build thì dùng `RUN --mount=type=secret` |
| Container chạy bằng root | Không khai báo `USER` | Thêm `USER node` (hoặc tạo user riêng) ở stage cuối, `chown` các file cần ghi |
| `docker stop` mất 10 giây mới dừng, request đang xử lý bị cắt | Process không nhận được SIGTERM vì `CMD` dạng shell (`CMD npm start`), hoặc npm không chuyển tiếp signal | Dùng dạng exec `CMD ["node", "dist/main.js"]`, gọi thẳng `node` thay vì qua `npm`, bật `enableShutdownHooks()` trong NestJS |
| `exec ./entrypoint.sh: no such file or directory` dù file có tồn tại | File có line ending CRLF (sửa trên Windows) | Cấu hình `.gitattributes` với `*.sh text eol=lf`, hoặc chuyển file sang LF |
| Dùng `node:latest`, build tuần sau tự nhiên lỗi | Base image đã lên major mới | Pin version cụ thể |
| Data Postgres mất khi recreate container | Không mount volume vào `/var/lib/postgresql/data` | Khai báo named volume |
| Build trên Mac M-series, deploy lên server x86 báo `exec format error` | Image được build cho kiến trúc arm64 | `docker buildx build --platform linux/amd64`, hoặc build trong CI |
| `depends_on` đã có mà API vẫn lỗi vì DB chưa sẵn sàng | `depends_on` mặc định chỉ chờ container **start**, không chờ **ready** | Dùng `condition: service_healthy` kèm healthcheck, đồng thời cho app có retry khi kết nối |

## 7. Debug nhanh

Container không chạy hoặc vừa chạy đã thoát:
1. `docker ps -a`: xem cột STATUS, ví dụ `Exited (1)`. Mã 137 = bị kill (thường là OOM), 139 = segfault.
2. `docker logs <ctr>`: đọc dòng lỗi đầu tiên, không phải dòng cuối cùng.
3. `docker inspect <ctr> --format '{{.State.OOMKilled}} {{.State.ExitCode}}'`.
4. Chạy tương tác để xem bên trong: `docker run --rm -it --entrypoint sh <img>`, rồi `ls`, `env`, `node -v`.
5. Kiểm tra env: thiếu biến bắt buộc → app fail fast (PXM-9) và log sẽ nói rõ biến nào.

Không gọi được service:
1. Port đã publish chưa? `docker ps` phải hiện `0.0.0.0:3000->3000/tcp`.
2. App có listen trên `0.0.0.0` không? Listen trên `127.0.0.1` **trong container** thì bên ngoài không gọi vào được.
3. Hai container có cùng network không? `docker network inspect <net>`.
4. Từ container A gọi thử: `docker compose exec api wget -qO- http://postgres:5432` (hoặc `nc -zv postgres 5432`).

Build chậm hoặc image to:
1. `docker history <img>`: tìm layer nặng.
2. Kiểm tra `.dockerignore`. Dòng "transferring context: X MB" trong log build cho biết context lớn cỡ nào.
3. Kiểm tra thứ tự `COPY`: layer nào bị build lại không cần thiết?

## 8. Trong PixelMart

| Version | Dùng thế nào | Ticket/plan |
|---|---|---|
| v1 | Dockerfile multi-stage cho API (`turbo prune`), Compose local với Postgres. Render chạy image API | PXM-11 ([plan Sprint 1](../v1/plans/sprint-01.md)), PXM-12 (docker build trong CI), PXM-13 |
| v3 | Compose **production** trên VPS: api ×2, web, admin, postgres, nginx. Image push lên GHCR, deploy qua SSH | v3 (chưa viết) |
| v4–v5 | Thêm Prometheus, Grafana, Redis, RabbitMQ vào Compose | v4, v5 |
| v7 | Image trở thành đơn vị deploy của Kubernetes. Thêm tag theo SHA, quét lỗ hổng | v7 |

## 9. Câu hỏi phỏng vấn hay gặp

1. Container khác VM thế nào?
<details><summary>Gợi ý trả lời</summary>

Container dùng chung kernel với host, được cô lập bằng namespaces và giới hạn tài nguyên bằng cgroups, nên nhẹ và khởi động nhanh. VM có kernel riêng trên hypervisor: cô lập mạnh hơn nhưng nặng hơn. Container không cô lập bằng VM: một lỗ hổng kernel có thể ảnh hưởng tới mọi container trên host.
</details>

2. `CMD` và `ENTRYPOINT` khác nhau thế nào?
<details><summary>Gợi ý trả lời</summary>

`ENTRYPOINT` là lệnh cố định. `CMD` là tham số mặc định, bị ghi đè khi bạn chạy `docker run <img> <args>`. Kết hợp: `ENTRYPOINT ["node"]` + `CMD ["dist/main.js"]`. Nên dùng dạng exec (JSON array) để process nhận được signal.
</details>

3. Làm sao để image nhỏ và build nhanh?
<details><summary>Gợi ý trả lời</summary>

Multi-stage, base image nhỏ (alpine/slim/distroless), `.dockerignore`, sắp xếp layer từ ít thay đổi tới hay thay đổi, chỉ cài production deps ở stage cuối, dùng BuildKit cache mount.
</details>

4. Dữ liệu trong container sẽ ra sao khi container bị xóa? Volume và bind mount khác gì nhau?
<details><summary>Gợi ý trả lời</summary>

Writable layer bị xóa theo container. Volume do Docker quản lý, nằm ngoài vòng đời container, phù hợp cho data DB. Bind mount gắn một thư mục cụ thể của host vào container, phù hợp khi dev (hot reload) hoặc khi cần file config.
</details>

5. Làm sao truyền secret vào container cho an toàn?
<details><summary>Gợi ý trả lời</summary>

Truyền lúc runtime qua env/secret store của nền tảng (Render env, Docker/K8s secrets). Không dùng `ARG`/`ENV` trong Dockerfile, không `COPY .env`. Nếu cần lúc build (ví dụ token npm private) thì dùng `RUN --mount=type=secret`.
</details>

6. Vì sao không nên chạy container bằng root?
<details><summary>Gợi ý trả lời</summary>

Nếu app bị khai thác, kẻ tấn công có quyền root trong container. Kết hợp với cấu hình sai (mount docker socket, privileged) hoặc lỗ hổng kernel, chúng có thể leo thang lên host. Non-root là lớp phòng thủ chiều sâu, chi phí gần như bằng 0.
</details>

7. `depends_on` có đảm bảo DB sẵn sàng không?
<details><summary>Gợi ý trả lời</summary>

Mặc định thì không, nó chỉ đảm bảo thứ tự start. Cần `condition: service_healthy` + healthcheck. Ngoài ra app vẫn nên có retry vì trong production DB có thể restart bất kỳ lúc nào.
</details>

## 10. Tài liệu chính thức

- Docker docs, phần concepts: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
- Dockerfile reference: https://docs.docker.com/reference/dockerfile/
- Best practices khi build: https://docs.docker.com/build/building/best-practices/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Compose file reference: https://docs.docker.com/reference/compose-file/
- Turborepo + Docker (`turbo prune --docker`): https://turborepo.com/docs/guides/tools/docker
- Node.js Docker best practices: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
