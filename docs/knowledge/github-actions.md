# GitHub Actions

> **TL;DR:** GitHub Actions là hệ thống CI/CD có sẵn trong GitHub. Mỗi khi có sự kiện (push, mở PR, tạo tag…), GitHub chạy các **workflow** viết bằng YAML trên máy ảo (runner) để lint, test, build và deploy. PixelMart dùng nó làm CI cho mọi PR (chặn merge khi lỗi) và CD lên Render/Vercel từ v1, deploy qua SSH ở v3, và làm CI bên cạnh Jenkins (CD) ở v7.

## 1. Nó là gì & giải quyết vấn đề gì

**Vấn đề:** "Em chạy test trên máy em pass rồi mà." Nhưng có thể bạn quên chạy lint, máy bạn có biến môi trường mà máy khác không có, hoặc bạn merge lúc 11 giờ đêm mà quên migrate DB trước khi deploy. Mọi bước làm bằng tay đều có ngày bị quên.

**CI (Continuous Integration):** mỗi thay đổi đều được kiểm tra tự động trên một môi trường sạch, giống nhau cho mọi người. Kết quả hiện ngay trên PR, và **không xanh thì không được merge**.

**CD (Continuous Delivery/Deployment):** merge vào nhánh release là hệ thống tự migrate, build, deploy. Mọi bước được ghi lại thành code, nên lặp lại được và audit được.

**So sánh đời thường:** CI giống **dây chuyền kiểm tra chất lượng** trong nhà máy. Sản phẩm nào cũng phải qua đủ các trạm, công nhân không thể "ngẫu hứng" bỏ qua một trạm.

## 2. Mô hình tư duy

```
Event (pull_request, push, tag, schedule, workflow_dispatch)
  └─▶ Workflow (.github/workflows/ci.yml)
        ├─ Job "ci"     (runner ubuntu-latest, VM mới, sạch)
        │    ├─ step: actions/checkout
        │    ├─ step: setup pnpm + node (cache)
        │    ├─ step: pnpm install --frozen-lockfile
        │    └─ step: pnpm turbo lint typecheck test build
        └─ Job "deploy" (needs: ci, chỉ chạy trên main)
             └─ step: migrate DB → gọi deploy hook
```

| Khái niệm | Ý nghĩa |
|---|---|
| **Workflow** | File YAML trong `.github/workflows/`, được kích hoạt bởi `on:` |
| **Job** | Một nhóm step chạy trên **một runner**. Các job mặc định chạy **song song**. `needs:` tạo thứ tự giữa chúng |
| **Step** | Một lệnh shell (`run:`) hoặc một action dùng lại được (`uses:`) |
| **Runner** | Máy chạy job: GitHub-hosted (VM mới mỗi lần) hoặc self-hosted |
| **Action** | Gói step tái sử dụng: `actions/checkout`, `pnpm/action-setup`… |
| **Cache vs Artifact** | Cache = tăng tốc (deps, `.turbo`), có thể mất bất cứ lúc nào. Artifact = sản phẩm của run (báo cáo test, bundle) để tải về hoặc truyền sang job khác |
| **Secrets vs Variables** | Secret được mã hóa và che (`***`) trong log. Variable là giá trị không nhạy cảm. Cả hai đặt ở cấp repo, environment hoặc organization |
| **Environment** | Ví dụ `production`: chứa secret riêng, có thể yêu cầu người duyệt trước khi job chạy |
| **`GITHUB_TOKEN`** | Token tự sinh cho mỗi run. Quyền được cấu hình qua `permissions:` |
| **Required status check** | Rule của branch: check mang tên X phải xanh thì mới được merge |

## 3. Lệnh / cấu hình hay dùng

> ⚠️ **Đang ở v1 và chưa xong PXM-12?** Theo [rule 05](../rules/05-working-with-claude.md), workflow GitHub Actions **đầu tiên** phải do bạn tự viết. Các đoạn YAML dưới đây ghép lại gần như thành một `ci.yml` hoàn chỉnh, nên chúng được giấu trong khối bên dưới. Hãy tự viết `ci.yml` bằng mục 2 và docs chính thức (mục 10) trước, rồi mới mở ra để so sánh. Bảng lệnh `gh` ở cuối mục này thì xem lúc nào cũng được.

<details><summary>Mở sau khi đã tự viết ci.yml (PXM-12): các đoạn YAML mẫu</summary>

**Trigger thường dùng**

```yaml
on:
  pull_request:                 # mọi PR (vào develop/main)
  push:
    branches: [develop, main]
  workflow_dispatch:            # nút "Run workflow" chạy tay

concurrency:                    # push mới thì hủy run cũ của cùng branch/PR
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read                # quyền tối thiểu cho GITHUB_TOKEN
```

**Setup pnpm + Node có cache** (pnpm version lấy từ field `packageManager` trong `package.json`)

```yaml
steps:
  - uses: actions/checkout@v6
  - uses: pnpm/action-setup@v6          # không cần ghi version: đọc từ packageManager
  - uses: actions/setup-node@v6
    with:
      node-version-file: .nvmrc
      cache: pnpm                       # cache pnpm store theo lockfile
  - run: pnpm install --frozen-lockfile
```

> Major version của action thay đổi theo thời gian. Kiểm tra trang Marketplace/README của action trước khi dùng, và pin major version (`@v6`) hoặc commit SHA.

**Cache Turborepo (local cache trong `.turbo`)**

```yaml
  - uses: actions/cache@v4
    with:
      path: .turbo
      key: ${{ runner.os }}-turbo-${{ github.sha }}
      restore-keys: |
        ${{ runner.os }}-turbo-
```

**Postgres cho integration test (v1, PXM-14)**

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: pixelmart_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U test"
          --health-interval 5s --health-retries 10
    env:
      # job chạy trên runner nên dùng localhost
      DATABASE_URL: postgresql://test:test@localhost:5432/pixelmart_test   # app/test (Prisma adapter)
      DIRECT_URL: postgresql://test:test@localhost:5432/pixelmart_test     # Prisma CLI (prisma.config.ts) — trên CI hai URL giống nhau
```

**Chỉ chạy job ở `main`, sau CI**

```yaml
  deploy:
    needs: ci
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: production
    runs-on: ubuntu-latest
```

</details>

**Build image → GHCR → deploy qua SSH (v3)**

> Lần đầu viết job build/push và deploy (S14-01, S14-02), hãy tự viết từ docs của từng action (mục 10) rồi mới mở phần dưới để đối chiếu. Major version của action dưới đây là tại thời điểm viết, kiểm tra lại trước khi dùng.

<details><summary>Mở sau khi đã tự viết job build/deploy (S14-01, S14-02): các đoạn YAML mẫu</summary>

**Push image lên GHCR bằng `GITHUB_TOKEN`** (không cần PAT)

```yaml
  build-images:
    needs: ci
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write                     # chỉ job này được ghi vào GHCR
    steps:
      - uses: actions/checkout@v6
      - uses: docker/setup-buildx-action@v4
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v6
        with:
          images: ghcr.io/${{ github.repository_owner }}/pixelmart-api   # tên image phải viết thường
          tags: |
            type=sha,prefix=sha-
            # tag vX.Y.Z: gắn cho image đã có bằng `docker buildx imagetools create`, không build lại
      - uses: docker/build-push-action@v7
        with:
          context: .
          file: apps/api/Dockerfile
          platforms: linux/amd64
          push: ${{ github.event_name != 'pull_request' }}             # PR: chỉ build để kiểm tra
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}                     # label OCI: source, revision…
          cache-from: type=gha,scope=api
          cache-to: type=gha,mode=max,scope=api
```

**Deploy qua SSH: environment, concurrency, host key cố định**

```yaml
  deploy-vps:
    needs: build-images
    if: (github.event_name == 'push' && github.ref == 'refs/heads/main') || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment: production-vps          # secret riêng: SSH_HOST, SSH_PRIVATE_KEY, SSH_KNOWN_HOSTS
    concurrency:
      group: deploy-vps
      cancel-in-progress: false          # không bao giờ hủy một deploy đang chạy dở
    steps:
      - name: Configure SSH
        env:                             # secret qua env, không nội suy thẳng vào lệnh
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SSH_KNOWN_HOSTS: ${{ secrets.SSH_KNOWN_HOSTS }}   # lấy bằng ssh-keyscan MỘT LẦN, đã xác minh fingerprint
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "$SSH_PRIVATE_KEY" > ~/.ssh/id_ed25519 && chmod 600 ~/.ssh/id_ed25519
          printf '%s\n' "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
      - name: Deploy
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}   # IP của VPS hoặc bản ghi DNS-only: SSH không đi qua proxy Cloudflare
        run: ssh "deploy@$SSH_HOST" "/srv/pixelmart/deploy.sh sha-${GITHUB_SHA::7}"
```

</details>

**`gh` CLI để theo dõi từ terminal**

| Lệnh | Dùng khi |
|---|---|
| `gh run list --limit 5` | Xem các run gần nhất |
| `gh run watch` | Theo dõi run đang chạy |
| `gh run view <id> --log-failed` | Chỉ xem log của step bị lỗi |
| `gh run rerun <id> --failed` | Chạy lại các job lỗi |
| `gh workflow run deploy.yml --ref main` | Kích hoạt `workflow_dispatch` trên branch `main` (`-f key=value` dùng để truyền **input** của workflow) |
| `gh secret set RENDER_DEPLOY_HOOK_URL --env production` | Đặt secret cho environment `production` (nhập giá trị qua prompt, không lưu vào shell history) |

**Chạy thử ở local:** [`act`](https://github.com/nektos/act) chạy workflow trong Docker. Hữu ích để thử nhanh cú pháp, nhưng không giống 100% runner thật.

## 4. Dùng thế nào cho hiệu quả

1. **Fail fast, rẻ trước, đắt sau:** lint, typecheck chạy trước; test, build, docker build chạy sau. Lỗi format thì không cần chờ 5 phút build mới biết.
2. **Cache đúng thứ:** pnpm store (theo lockfile) và `.turbo` (theo SHA, kèm `restore-keys`). Không cache `node_modules` của pnpm vì nó là symlink tới store.
3. **`--frozen-lockfile`:** CI phải fail nếu lockfile lệch với `package.json`. Không được để CI tự âm thầm cập nhật deps.
4. **`permissions` tối thiểu** ở cấp workflow, chỉ mở thêm ở job thật sự cần (ví dụ `packages: write` khi push lên GHCR).
5. **Pin action:** ít nhất pin major (`@v6`). Với **mọi** action của bên thứ ba (không phải `actions/*` của GitHub), pin theo **commit SHA**, vì tag có thể bị đổi để trỏ sang code độc hại. Mức độ phổ biến không bảo vệ bạn: `tj-actions/changed-files`, một action được hàng chục nghìn repo dùng, đã bị chiếm và sửa tag năm 2025.
6. **Tách CI và CD rõ ràng:** CI chạy cho mọi PR. CD chỉ chạy trên `main`, `needs: ci`, dùng `environment: production`.
7. **Đặt tên job ổn định** vì required check gắn theo tên job. Đổi tên job thì phải sửa lại branch ruleset.
8. **`concurrency` cho deploy** với `cancel-in-progress: false`: đừng hủy một deploy đang chạy dở. Chỉ nên hủy các run CI cũ.
9. **Push image bằng `GITHUB_TOKEN`** với `permissions: packages: write` chỉ ở job build. Không tạo PAT dài hạn chỉ để push GHCR.
10. **Deploy job `needs:` job build**, và deploy đúng tag vừa build (`sha-<short>`), không dùng `latest`. Nhờ vậy rollback chỉ là deploy lại tag cũ.
11. **SSH an toàn:** key riêng cho CI (không dùng key cá nhân), lưu trong secret của **Environment** (ví dụ `production-vps`), và **cố định host key** bằng secret `known_hosts`. Không dùng `StrictHostKeyChecking=no`: nó tắt đúng cơ chế chống giả mạo server.
12. **Tránh action SSH bên thứ ba khi lệnh `ssh` có sẵn là đủ.** Runner Ubuntu đã có OpenSSH. Mỗi action bên thứ ba là thêm một chỗ có thể đọc được private key của bạn.
13. **Đo thời gian pipeline.** Mục tiêu của PixelMart là PR xanh trong dưới 5 phút. Chậm thì xem lại cache, và tách job song song nếu có ích.

## 5. Khi nào nên / không nên dùng

**Nên dùng khi:** code nằm trên GitHub, cần CI cho PR, CD đơn giản đến trung bình. Repo public được dùng phút chạy miễn phí không giới hạn trên runner tiêu chuẩn.

**Cân nhắc công cụ khác khi:**
- Cần chạy trong mạng nội bộ, cần phần cứng đặc biệt, hoặc build rất nặng/rất nhiều → self-hosted runner, hoặc Jenkins.
- Công ty đã chuẩn hóa trên GitLab/Jenkins/Azure DevOps.
- Cần CD phức tạp, nhiều môi trường, có approval và audit chặt → Jenkins, Argo CD (GitOps). Đây là lý do v7 đưa Jenkins vào.

| | GitHub Actions | Jenkins | GitLab CI |
|---|---|---|---|
| Hosting | SaaS (có self-hosted runner) | Tự host 100% | SaaS hoặc tự host |
| Cấu hình | YAML trong repo | `Jenkinsfile` (Groovy) + plugin | YAML trong repo |
| Hệ sinh thái | Marketplace action | Hơn 1800 plugin | Template có sẵn |
| Công vận hành | Gần như 0 | Cao (update, plugin, bảo mật) | Thấp (SaaS) |
| Phổ biến ở VN | Startup, dự án mới | Công ty outsource/enterprise lâu năm | Nhiều công ty product |

## 6. Bẫy fresher/junior hay gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Workflow không chạy chút nào | File không nằm trong `.github/workflows/`, sai indent YAML, hoặc trigger không khớp branch | Kiểm tra tab Actions xem có báo lỗi parse không. Dùng extension "GitHub Actions" trong VS Code để validate |
| PR không merge được vì chờ mãi một check "Expected — Waiting for status" | Required check đặt theo tên job, mà job đó không chạy (đổi tên, hoặc bị `paths:` filter bỏ qua) | Giữ tên job ổn định. Không dùng `paths` filter cho workflow chứa required check |
| Secret rỗng trên PR từ fork | Vì lý do bảo mật, GitHub không truyền secret cho PR từ fork | Đúng thiết kế. CI của PR không được cần secret production |
| Dùng `pull_request_target` để "có secret" | Event này chạy với quyền của repo gốc. Checkout code của PR rồi chạy là cho phép **code lạ chạy với secret của bạn** | Không dùng `pull_request_target` + checkout head của PR, trừ khi hiểu rõ rủi ro |
| Cache không bao giờ hit | Key chứa giá trị thay đổi mỗi lần, hoặc `path` sai | Key theo hash lockfile, thêm `restore-keys`. Xem log "Cache restored from key…" |
| `Resource not accessible by integration` | `GITHUB_TOKEN` thiếu quyền | Thêm quyền cần thiết vào `permissions:` của job |
| Secret bị in ra log | `echo $SECRET`, bật debug, hoặc secret bị biến đổi (base64) nên GitHub không che được | Không bao giờ echo secret. Dùng `::add-mask::` cho giá trị sinh ra lúc chạy |
| Cron chạy lệch 7 tiếng | `schedule` dùng giờ **UTC** | Tự quy đổi sang UTC. Ngoài ra lịch có thể trễ vài phút khi GitHub quá tải |
| Deploy chạy cả khi test fail | Job `deploy` thiếu `needs: ci` nên chạy song song | Luôn có `needs:` và điều kiện `if:` theo branch |
| CI pass nhưng production lỗi vì thiếu biến môi trường | CI không kiểm tra env của production | Validate env lúc boot (fail fast, PXM-9). Release checklist có bước đặt biến môi trường mới |
| `pnpm install` trên CI tự sửa lockfile | Thiếu `--frozen-lockfile` | Luôn dùng `--frozen-lockfile` trong CI |
| Push GHCR báo `denied: installation not allowed to Create organization package` hoặc `permission_denied` | Thiếu `permissions: packages: write`, hoặc package đã tồn tại mà repo chưa được cấp quyền ghi | Thêm permission cho job. Trong cài đặt package, cấp quyền "Write" cho repo |
| `invalid reference format: repository name must be lowercase` | Tên owner/repo có chữ hoa (`NQB37`) | Dùng `docker/metadata-action` hoặc tự chuyển sang chữ thường |
| Dùng `StrictHostKeyChecking=no` cho "nhanh" | Bỏ qua kiểm tra host key → kẻ giả mạo server nhận được lệnh deploy và secret | Lưu `known_hosts` đã xác minh vào secret |
| Hai merge liên tiếp, hai deploy chạy chồng nhau, server ở trạng thái nửa nọ nửa kia | Không có `concurrency` cho job deploy | `concurrency` group cố định, `cancel-in-progress: false` |
| Job deploy SSH timeout | Firewall chỉ mở port 22 cho IP của bạn, hoặc VPS chỉ có IPv6 (runner GitHub-hosted không có IPv6 ra Internet) | Port 22 nhận mọi IP nhưng chỉ chấp nhận key. VPS phải có IPv4 |
| Build image trong CI lần nào cũng chậm như lần đầu | Runner sạch, không có layer cache | `cache-from`/`cache-to: type=gha` của buildx |
| Workflow tạo commit/tag xong không kích hoạt workflow khác | Sự kiện tạo bởi `GITHUB_TOKEN` không trigger workflow mới (để tránh vòng lặp) | Dùng `workflow_call`/`needs`, hoặc PAT/GitHub App nếu thật sự cần |

## 7. Debug nhanh

1. **Đọc step đỏ đầu tiên**, không phải step cuối. `gh run view <id> --log-failed`.
2. **Tái hiện ở local** với đúng lệnh CI chạy: `pnpm install --frozen-lockfile && pnpm turbo lint typecheck test build`.
3. **Khác biệt môi trường:** OS (Linux phân biệt hoa thường trong tên file, Windows thì không), version Node, biến env, timezone (runner dùng UTC).
4. **Bật debug log:** chạy lại với "Enable debug logging", hoặc đặt secret `ACTIONS_STEP_DEBUG=true`.
5. **Cache nghi bị hỏng:** xóa cache trong tab Actions → Caches, hoặc đổi prefix key.
6. **Lỗi chập chờn (flaky):** test phụ thuộc thời gian/thứ tự, DB không được dọn giữa các test. Chạy lại vài lần để xác nhận, rồi sửa test, **đừng chỉ bấm re-run cho qua**.

## 8. Trong PixelMart

| Version | Dùng thế nào | Ticket/plan |
|---|---|---|
| v1 | CI: lint → typecheck → test (Postgres service) → build → docker build. Required check `ci`. CD: migrate Neon → Render deploy hook. Upload source map cho Sentry | PXM-12, PXM-13 ([plan Sprint 1](../v1/plans/sprint-01.md)), PXM-14, PXM-15, PXM-19 ([plan Sprint 2](../v1/plans/sprint-02.md)) |
| v3 | Build 3 image (`api`, `web`, `edge`) → push GHCR (tag `sha-…`, cache gha) → job deploy qua SSH (environment `production-vps`, `concurrency`) chạy script trên VPS: migrate → rolling `api-1`/`api-2` → smoke test → rollback bằng tag cũ | [v3](../v3/README.md): S14-01, S14-02 ([plan Sprint 14](../v3/plans/sprint-14.md)), S15-04 (xóa job Render/Vercel) |
| v7 | GitHub Actions giữ vai trò CI cho PR. Jenkins nhận nhiệm vụ CD lên Kubernetes | v7 (chưa viết) |

## 9. Câu hỏi phỏng vấn hay gặp

1. CI, Continuous Delivery và Continuous Deployment khác nhau thế nào?
<details><summary>Gợi ý trả lời</summary>

CI: mỗi thay đổi được build và test tự động khi tích hợp. Continuous Delivery: code luôn ở trạng thái deploy được, nhưng bước lên production có thể cần một người bấm. Continuous Deployment: mọi thay đổi qua được pipeline đều tự lên production. PixelMart v1 gần với Continuous Deployment trên `main` (merge release PR là deploy).
</details>

2. Cache và artifact khác nhau thế nào?
<details><summary>Gợi ý trả lời</summary>

Cache dùng để tăng tốc, có thể bị xóa bất cứ lúc nào, pipeline vẫn phải chạy đúng khi không có cache. Artifact là sản phẩm của một run, được lưu lại để tải về hoặc truyền giữa các job.
</details>

3. Làm sao bảo vệ secret trong CI?
<details><summary>Gợi ý trả lời</summary>

Lưu trong secrets/environment, không bao giờ hardcode. `permissions` tối thiểu. Không echo secret. Không chạy code lạ khi có secret (`pull_request_target`). Pin action theo SHA. Dùng environment có người duyệt cho production. Dùng OIDC thay cho secret dài hạn khi nền tảng hỗ trợ.
</details>

4. Pipeline chậm 15 phút, bạn tối ưu thế nào?
<details><summary>Gợi ý trả lời</summary>

Đo xem step nào chậm. Cache deps và build cache (Turborepo). Chạy song song các job độc lập. Chỉ build/test phần bị ảnh hưởng (`turbo --filter=...[origin/develop]`). Hủy run cũ bằng `concurrency`. Dùng runner mạnh hơn nếu đáng tiền.
</details>

5. Vì sao migration DB nên chạy **trước** khi deploy code mới, và migration cần có tính chất gì?
<details><summary>Gợi ý trả lời</summary>

Code mới có thể cần cột/bảng mới. Nếu deploy trước thì code mới chạy trên schema cũ và lỗi. Migration phải **tương thích ngược** (expand/contract) vì trong lúc deploy, code cũ vẫn đang chạy trên schema mới, và nếu phải rollback code thì DB không tự rollback theo.
</details>

6. Required status check là gì, và vì sao nên đặt?
<details><summary>Gợi ý trả lời</summary>

Là rule của branch: chỉ cho merge khi các check được chỉ định đã xanh. Nhờ vậy CI trở thành một "cổng" bắt buộc thay vì một gợi ý.
</details>

7. Deploy qua SSH từ CI: bạn bảo vệ server và key thế nào?
<details><summary>Gợi ý trả lời</summary>

Key riêng cho CI, lưu trong secret của environment, user deploy có quyền tối thiểu (không sudo mật khẩu trống, có thể giới hạn lệnh bằng `command=` trong `authorized_keys`). Cố định host key bằng `known_hosts` đã xác minh, không tắt `StrictHostKeyChecking`. Dùng `concurrency` để không deploy chồng nhau. Xoay key định kỳ và ngay khi nghi bị lộ.
</details>

## 10. Tài liệu chính thức

- Tổng quan: https://docs.github.com/en/actions/get-started/understand-github-actions
- Cú pháp workflow: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Events kích hoạt workflow: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Bảo mật (secure use): https://docs.github.com/en/actions/reference/security/secure-use
- Service containers (Postgres): https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers
- `pnpm/action-setup`: https://github.com/pnpm/action-setup
- Turborepo trên GitHub Actions: https://turborepo.com/docs/guides/ci-vendors/github-actions
- Publish Docker image lên GHCR: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- Environments: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- `concurrency`: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
- `docker/build-push-action`: https://github.com/docker/build-push-action
- `docker/metadata-action`: https://github.com/docker/metadata-action
