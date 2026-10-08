# 06 — Definition of Ready & Definition of Done

## Definition of Ready (ticket được phép kéo vào sprint)

- [ ] Có tiêu đề rõ, thuộc một Epic
- [ ] Story có user story + **Acceptance Criteria** dạng Given/When/Then
- [ ] Có ghi "Ngoài phạm vi" nếu dễ hiểu nhầm
- [ ] Đã estimate, **≤ 5 điểm** (8 điểm chấp nhận nhưng nên tách)
- [ ] Không bị chặn bởi ticket chưa xong (hoặc ticket chặn nằm cùng sprint, làm trước)
- [ ] Biết sẽ test bằng cách nào

## Definition of Done — cấp Ticket

- [ ] Code đã merge vào `develop` qua PR (squash)
- [ ] Đáp ứng **mọi** AC
- [ ] Endpoint mới có integration test: happy path + lỗi validation + lỗi phân quyền (401/403/404)
- [ ] CI xanh: lint, typecheck, test, build
- [ ] Đã self-review + Claude review, mọi `blocker` đã xử lý
- [ ] Schema request/response nằm trong `packages/contracts`, không lộ type Prisma
- [ ] `.env.example`, README, ADR cập nhật nếu liên quan
- [ ] Ticket Jira chuyển Done, có link PR

## Definition of Done — cấp Sprint (Release)

- [ ] Sprint Goal đạt được
- [ ] `develop → main` đã merge, tag `vX.Y.0`, GitHub Release có changelog
- [ ] Đã deploy production, kiểm tra trên domain thật
- [ ] Migration chạy được trên DB có dữ liệu (không chỉ DB trống)
- [ ] Sentry không có lỗi mới chưa xử lý
- [ ] Video demo + retro note (`docs/retro/sprint-N.md`), velocity ghi lại
- [ ] Sprint đã Complete trên Jira
