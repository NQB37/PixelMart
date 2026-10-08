# 02 — Commits & Pull Requests

## Commit message: Conventional Commits

```
<type>(<scope>): <mô tả ngắn, thể mệnh lệnh, tiếng Anh, không viết hoa đầu, không dấu chấm>

[body: vì sao thay đổi, không phải thay đổi cái gì]

Refs: PXM-12
```

| type | Khi nào |
|---|---|
| `feat` | Tính năng mới cho người dùng |
| `fix` | Sửa bug |
| `refactor` | Đổi cấu trúc, không đổi hành vi |
| `test` | Thêm/sửa test |
| `docs` | Tài liệu, ADR |
| `chore` | Dependency, config, tooling |
| `ci` | GitHub Actions, Docker, deploy |
| `perf` | Tối ưu hiệu năng |

`scope` = module/app: `api`, `web`, `admin`, `contracts`, `auth`, `catalog`, `orders`, `db`, `ci`.

Ví dụ:
```
feat(auth): add refresh token rotation with reuse detection
fix(web): prevent double submit on checkout button
test(catalog): cover 409 when deleting non-empty category
ci: run prisma migrate deploy before render deploy hook
```

Thay đổi phá vỡ API: thêm `!` và footer `BREAKING CHANGE:`.
```
feat(api)!: rename price to priceMinor

BREAKING CHANGE: clients must send/receive integer minor units.
```

Commit trong branch feature có thể "lộn xộn" (wip...) vì sẽ squash — nhưng **tiêu đề PR phải chuẩn** vì nó trở thành commit trên `develop`.

## Pull Request

### Tiêu đề
`feat(auth): add login and register endpoints (PXM-12)` — đúng Conventional Commits + Jira key.

### Kích thước
- Mục tiêu **< 400 dòng** thay đổi (không tính lockfile, migration sinh tự động).
- Lớn hơn → tách: ví dụ PR 1 = schema + migration, PR 2 = API + test, PR 3 = UI.

### Mô tả PR (template — sẽ đặt tại `.github/pull_request_template.md` ở Sprint 1)

```markdown
## Jira
PXM-12

## Thay đổi gì & vì sao
-

## Cách kiểm tra
1.

## Screenshot / video (nếu có UI)

## Checklist
- [ ] Self-review diff (đọc lại toàn bộ trên GitHub như người lạ)
- [ ] Test mới cho logic mới (happy path + lỗi + phân quyền)
- [ ] CI xanh
- [ ] Cập nhật `.env.example` nếu thêm biến môi trường
- [ ] Migration chạy được trên DB đã có dữ liệu
- [ ] Cập nhật ADR/README nếu có quyết định kiến trúc
```

### Quy trình review

1. **Self-review trước** — mở tab "Files changed", đọc từng dòng. 50% lỗi được bắt ở bước này.
2. **Claude review** — xem [05-working-with-claude.md](05-working-with-claude.md#4-code-review).
3. Xử lý comment:
   - Đồng ý → sửa, push commit mới (không force-push khi đang review, để reviewer xem được diff mới).
   - Không đồng ý → trả lời lý do. Tranh luận bằng kỹ thuật, không bằng cảm xúc.
   - Mọi comment phải được **resolve** trước khi merge.
4. Merge:
   - `feature/fix/chore → develop`: **Squash and merge**
   - `develop → main` và `hotfix → main`: **Create a merge commit**
5. Xóa branch sau khi merge (bật "Automatically delete head branches").

### Mức độ comment khi review (quy ước nhiều công ty dùng)

| Tiền tố | Ý nghĩa |
|---|---|
| `blocker:` | Phải sửa trước khi merge (bug, bảo mật, sai yêu cầu) |
| `suggestion:` | Nên sửa, có thể bàn |
| `nit:` | Chi tiết nhỏ (tên biến, format), không bắt buộc |
| `question:` | Hỏi để hiểu, không phải yêu cầu sửa |
| `praise:` | Khen chỗ làm tốt — review không chỉ để bắt lỗi |
