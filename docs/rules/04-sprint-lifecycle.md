# 04 — Vòng đời một Sprint (2 tuần, ~14 giờ)

## Lịch mẫu

| Thời điểm | Hoạt động | Thời lượng | Đầu ra |
|---|---|---|---|
| **Ngày 1** | Sprint Planning | 45–60' | Sprint Goal, danh sách ticket, sprint bắt đầu trên Jira |
| Ngày 1 | Breakdown kỹ thuật với Claude (plan mode) | 30' | Sub-task / checklist trong ticket |
| Ngày 1–12 | Làm ticket: branch → code → test → PR → review → merge | ~10–11h | Ticket Done |
| Giữa sprint | Refinement cho sprint sau | 20' | Ticket sprint sau đạt DoR |
| **Ngày 13** | Code freeze: không merge tính năng mới vào `develop` | — | `develop` ổn định |
| Ngày 13 | Release PR `develop → main`, tag, deploy | 30' | `vX.Y.0` trên production |
| **Ngày 14** | Demo trên production + Retro + Complete sprint | 45' | Video demo, retro note, velocity |

## Sprint Planning — checklist

1. Xem lại retro sprint trước: có hành động nào cần đưa vào sprint này?
2. Viết **Sprint Goal** 1 câu, đo được. Ví dụ: *"Khách hàng đăng ký/đăng nhập được trên shop.example.com; admin đăng nhập được vào admin.example.com."*
3. Kéo ticket từ Backlog theo thứ tự ưu tiên cho đến ~80% velocity.
4. Mỗi ticket kéo vào phải đạt **Definition of Ready** ([06](06-definition-of-ready-and-done.md)).
5. Xác định rủi ro lớn nhất của sprint → làm ticket đó **đầu tiên**.

## Trong sprint

- Thứ tự ưu tiên mỗi buổi: **review/sửa PR đang mở > tiếp tục ticket đang dở > bắt ticket mới**. ("Stop starting, start finishing.")
- Bị kẹt > 30 phút: ghi lại đã thử gì → hỏi Claude (xem cách hỏi ở [05](05-working-with-claude.md)).
- Bị kẹt > 2 buổi: thu hẹp scope ticket, ghi rõ trong Jira, tạo ticket mới cho phần còn lại.

## Release checklist (Ngày 13)

```
[ ] Mọi ticket trong sprint: Done hoặc đã chuyển ra khỏi sprint
[ ] CI trên develop xanh
[ ] Migration mới đã thử trên DB local có dữ liệu seed
[ ] Biến môi trường mới đã thêm trên Render/Vercel (production)
[ ] PR develop → main: tiêu đề "release: vX.Y.0 (Sprint N)", mô tả = changelog
[ ] Merge commit (không squash)
[ ] Tag + GitHub Release
[ ] Deploy xong: /health OK, Sentry không có lỗi mới
[ ] Smoke test thủ công luồng của sprint trên domain thật
```

Nếu production lỗi sau release → quy trình **hotfix** ([01](01-git-branching.md#hotfix-bug-trên-production)). Nếu lỗi nặng và chưa sửa được nhanh → **rollback**: Render/Vercel cho phép redeploy bản trước (lưu ý: migration DB không tự rollback → luôn viết migration theo kiểu tương thích ngược).

## Retro template (`docs/retro/sprint-N.md`)

```markdown
# Sprint N — <Sprint Goal>
- Kế hoạch: X điểm · Hoàn thành: Y điểm · Version: vX.Y.0
## 👍 Tốt
## 👎 Chưa tốt
## 🔧 Thay đổi ở sprint sau (tối đa 2 hành động, có tạo ticket)
## 📚 Học được gì
```
