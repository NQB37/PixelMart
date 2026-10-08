# 01 — Git Branching Model

Mô hình: **GitFlow rút gọn** (`main` + `develop` + branch ngắn hạn). Đây là mô hình rất phổ biến ở các công ty outsource/product tại Việt Nam và châu Âu.

## Các loại branch

| Branch | Tạo từ | Merge vào | Sống bao lâu | Ý nghĩa |
|---|---|---|---|---|
| `main` | — | — | Vĩnh viễn | **Production.** Mỗi commit trên `main` là một version đã phát hành. Tự deploy. |
| `develop` | `main` (1 lần) | `main` (cuối sprint) | Vĩnh viễn | Nhánh tích hợp. Chứa mọi tính năng đã xong của sprint hiện tại. |
| `feature/<KEY>-<mô-tả>` | `develop` | `develop` | 1–3 ngày | Một Story/Task. |
| `fix/<KEY>-<mô-tả>` | `develop` | `develop` | < 1 ngày | Sửa bug **chưa** lên production. |
| `chore/<KEY>-<mô-tả>` | `develop` | `develop` | < 1 ngày | Config, CI, dependency, refactor không đổi hành vi. |
| `hotfix/<KEY>-<mô-tả>` | **`main`** | **`main`** rồi back-merge `develop` | Vài giờ | Bug khẩn cấp **đang ở production**. |

Ví dụ tên branch:
```
feature/PXM-12-login-api
feature/PXM-31-product-detail-page
fix/PXM-40-cart-total-rounding
chore/PXM-5-setup-github-actions
hotfix/PXM-52-checkout-500-error
```
Quy tắc tên: chữ thường, gạch ngang, **luôn có Jira key** (để Jira tự liên kết branch/PR/commit vào ticket).

## Luồng hằng ngày (feature)

```bash
git checkout develop
git pull origin develop
git checkout -b feature/PXM-12-login-api

# ... code, commit nhỏ, thường xuyên ...

git fetch origin
git rebase origin/develop          # cập nhật trước khi mở PR, giải quyết conflict tại máy
git push -u origin feature/PXM-12-login-api
# mở PR → develop
```

> Chỉ `rebase` branch **của riêng bạn**. Không bao giờ rebase `develop` hay `main`.

## Release (cuối mỗi sprint)

```
develop ──●──●──●──●──┐
                      │  PR "Release v0.2.0" (develop → main)
main    ──●───────────●  ← tag v0.2.0 → GitHub Actions deploy production
```

1. Đảm bảo mọi ticket sprint đã merge vào `develop`, CI trên `develop` xanh.
2. Mở PR `develop → main`, tiêu đề `release: v0.2.0 (Sprint 2)`. Mô tả = changelog (danh sách ticket).
3. Merge bằng **"Create a merge commit"** (KHÔNG squash — squash làm lịch sử `main` và `develop` lệch nhau, lần sau sẽ conflict giả).
4. Tag trên `main`: `git tag -a v0.2.0 -m "Sprint 2: Data layer & Admin shell" && git push --tags`, tạo GitHub Release.
5. Kiểm tra production (smoke test thủ công theo checklist demo).

### Quy tắc đánh version (SemVer)

| Thời điểm | Version |
|---|---|
| Sprint 1 → Sprint 6 | `v0.1.0` → `v0.6.0` (minor tăng mỗi sprint) |
| Sprint 7 (MVP hoàn chỉnh) | `v1.0.0` |
| Hotfix | tăng patch: `v0.2.0` → `v0.2.1` |
| Sau v1 | Tính năng mới → minor; phá vỡ API → major |

## Hotfix (bug trên production)

```bash
git checkout main && git pull
git checkout -b hotfix/PXM-52-checkout-500-error
# sửa + viết test tái hiện bug
# PR → main, merge, tag v0.5.1 → auto deploy
git checkout develop && git pull
git merge origin/main               # BẮT BUỘC back-merge, nếu không bug sẽ quay lại ở release sau
git push origin develop             # (hoặc mở PR main → develop nếu develop bị protect)
```

## Môi trường & deploy

| Branch | CI (lint/typecheck/test/build) | Deploy |
|---|---|---|
| PR bất kỳ | ✅ | Vercel preview (web/admin) |
| `develop` | ✅ | Không deploy API (v1 chỉ có production) |
| `main` | ✅ | **Production**: migrate DB → deploy API (Render) → web/admin (Vercel) |

> Ghi chú: Công ty thật thường có `develop → staging`. Ta hoãn staging sang v2 để giữ free tier đơn giản. Hệ quả: `develop` chỉ được kiểm chứng bằng test tự động + chạy local → **test integration càng quan trọng**.

## Branch protection (GitHub → Settings → Rules)

Áp dụng cho cả `main` và `develop`:
- Require pull request before merging
- Require status checks to pass (job `ci`)
- Require branch to be up to date before merging
- Block force push & deletion
- `main`: chỉ nhận PR từ `develop` hoặc `hotfix/*` (kiểm tra bằng mắt trong review, hoặc thêm job CI kiểm tra `github.head_ref`)

> ⚠️ GitHub Free chỉ hỗ trợ branch protection cho **repo public** (repo private cần GitHub Pro). Repo public cũng tốt cho portfolio và có GitHub Actions không giới hạn phút. **Không bao giờ commit secret** — xem `.env.example`.

## Cấm

- Push trực tiếp lên `main`/`develop`
- `git push --force` lên branch dùng chung (với branch của bạn: dùng `--force-with-lease`)
- Merge `main` → `feature/*` (cập nhật từ `develop`, không phải từ `main`)
- Branch sống > 1 tuần. Nếu ticket quá lớn → tách ticket.
