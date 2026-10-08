# Quy trình làm việc (Working Agreement)

Bộ tài liệu này mô phỏng cách một team product thật vận hành, áp dụng cho một người làm (solo) + Claude làm mentor/reviewer.
Mục tiêu: hình thành **thói quen** mà khi vào công ty bạn dùng được ngay.

| File | Nội dung |
|---|---|
| [01-git-branching.md](01-git-branching.md) | Mô hình branch `main` / `develop` / `feature/*`, merge, hotfix, tag version |
| [02-commits-and-pull-requests.md](02-commits-and-pull-requests.md) | Conventional Commits, quy tắc PR, review |
| [03-jira-workflow.md](03-jira-workflow.md) | Cách tổ chức Jira: Epic/Story/Task, viết ticket, board, estimate |
| [04-sprint-lifecycle.md](04-sprint-lifecycle.md) | Một sprint 2 tuần diễn ra thế nào, từ planning đến release |
| [05-working-with-claude.md](05-working-with-claude.md) | Làm việc với Claude Code hiệu quả (mà vẫn học được) |
| [06-definition-of-ready-and-done.md](06-definition-of-ready-and-done.md) | Checklist DoR / DoD |

## Toàn cảnh một vòng đời công việc

```
Jira ticket (Ready)
   │  PXM-12: "Đăng nhập bằng email/password"
   ▼
git checkout develop && git pull
git checkout -b feature/PXM-12-login-api
   │  code + test (Claude: plan → bạn viết → Claude review)
   ▼
PR: feature/PXM-12-login-api → develop      ← CI xanh + self-review + Claude review
   │  squash merge, ticket → Done
   ▼
... lặp lại cho các ticket khác trong sprint ...
   ▼
Cuối sprint: PR release develop → main       ← "Release v0.2.0"
   │  merge commit, tag v0.2.0, auto deploy production
   ▼
Demo trên production + Retro + đóng sprint trên Jira
```

## Nguyên tắc cốt lõi

1. **Không có ticket thì không có code.** Mọi branch đều gắn với một Jira issue key.
2. **Không ai push thẳng vào `main` hay `develop`.** Kể cả bạn. Mọi thay đổi đi qua PR.
3. **`main` luôn deploy được.** `main` = production. Merge vào `main` = phát hành một version.
4. **Nhỏ và thường xuyên.** PR nhỏ (< ~400 dòng), merge trong 1–2 ngày, không ôm branch cả tuần.
5. **Ghi lại quyết định.** Quyết định kiến trúc → ADR trong `docs/adr/`. Quyết định sản phẩm → comment trong Jira.
6. **Claude là mentor/reviewer, không phải người làm thay.** Xem [05-working-with-claude.md](05-working-with-claude.md).
