# 03 — Làm việc với Jira

> Jira Cloud Free: tối đa 10 user, đủ dùng. Tạo project kiểu **Scrum** (company-managed hoặc team-managed đều được), key: `PXM`.
> Cài app **"GitHub for Jira"** để branch/commit/PR có `PXM-xx` tự hiện trong ticket (Development panel).
>
> Không muốn dùng Jira? **GitHub Projects** làm được 80% điều này và gắn chặt với repo. Nhưng nếu mục tiêu là quen môi trường công ty → dùng Jira.

## 1. Cấu trúc issue

```
Epic        (1 module lớn / 1 sprint)      PXM-1  "Identity & Auth"
 └ Story    (giá trị cho người dùng)       PXM-12 "Là khách hàng, tôi muốn đăng nhập..."
    └ Sub-task (bước kỹ thuật, tùy chọn)   PXM-13 "API login", PXM-14 "Trang login"
 Task       (việc kỹ thuật, không có người dùng trực tiếp)  PXM-5 "Setup GitHub Actions"
 Bug        (hành vi sai so với yêu cầu)   PXM-40 "Tổng tiền giỏ hàng làm tròn sai"
 Spike      (nghiên cứu có time-box)       PXM-8  "So sánh Render vs Fly.io (time-box 2h)"
```

Epic của từng version nằm trong `docs/vN/README.md`. Ví dụ v1:
`Platform & DevOps` · `Identity & Auth` · `Catalog` · `Storefront & Cart` · `Checkout & Orders` · `Release v1.0`

## 2. Viết ticket tốt

### Story template

```
Tiêu đề: Khách hàng đăng nhập bằng email/password

User story:
  Là khách hàng đã có tài khoản,
  tôi muốn đăng nhập bằng email và mật khẩu,
  để xem đơn hàng và checkout.

Acceptance Criteria (Given / When / Then):
  AC1. Given email & mật khẩu đúng, When gửi form, Then nhận cookie access + refresh và chuyển về trang trước đó.
  AC2. Given mật khẩu sai, When gửi form, Then hiển thị "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại).
  AC3. Given sai quá 5 lần/phút, Then nhận 429.

Ghi chú kỹ thuật:
  - Endpoint POST /v1/auth/login, schema loginSchema trong packages/contracts
  - Xem ADR-0004 (JWT + refresh rotation)

Ngoài phạm vi:
  - Quên mật khẩu (v2)
```

### Bug template

```
Môi trường: production v0.4.0 / local
Các bước tái hiện: 1. … 2. … 3. …
Kết quả mong đợi:
Kết quả thực tế:
Bằng chứng: screenshot, link Sentry, request ID trong log
Mức độ: Blocker / Critical / Major / Minor
```

## 3. Board (workflow)

```
Backlog → To Do (sprint) → In Progress → In Review → Done
```

| Cột | Điều kiện vào |
|---|---|
| To Do | Ticket đạt **Definition of Ready** và đã kéo vào sprint |
| In Progress | Đã tạo branch. **WIP limit = 1–2** (làm xong rồi mới bắt việc mới) |
| In Review | PR đã mở, CI xanh |
| Done | PR đã merge vào `develop` + đạt **Definition of Done** |

Tự động hóa (Jira Automation, có sẵn bản free):
- Branch được tạo → chuyển ticket sang **In Progress**
- PR được mở → **In Review**
- PR được merge → **Done**

## 4. Estimate & capacity

- Dùng **story points** thang Fibonacci: 1, 2, 3, 5, 8. Ticket **13 trở lên phải tách**.
- Gợi ý quy đổi lúc mới bắt đầu (sẽ tự hiệu chỉnh sau 2–3 sprint): 1 điểm ≈ 1–2 giờ.
- Capacity: 6–8 giờ/tuần × 2 tuần ≈ 14 giờ → **khoảng 8–10 điểm/sprint**. Chỉ cam kết ~80%, giữ 20% cho bug và việc phát sinh.
- Cuối mỗi sprint ghi lại **velocity** (số điểm thực sự Done). Sau 3 sprint, dùng trung bình velocity để lên kế hoạch — đây là cách công ty thật dự báo tiến độ.
- Ticket chưa xong cuối sprint → **không** tính điểm, chuyển sang sprint sau (Jira hỏi khi Complete sprint).

## 5. Thói quen hằng ngày (bản solo của các ceremony)

| Ceremony | Công ty thật | Bản solo của bạn |
|---|---|---|
| Daily stand-up | 15 phút mỗi sáng | Mỗi buổi code, comment vào ticket đang làm: *Hôm qua / Hôm nay / Vướng gì* |
| Backlog refinement | 1 giờ/tuần | Giữa sprint, 20 phút viết AC cho ticket sprint sau |
| Sprint planning | 1–2 giờ | Đầu sprint, chọn ticket theo velocity, đặt **Sprint Goal** 1 câu |
| Sprint review/demo | 1 giờ | Quay video 3–5 phút demo trên production |
| Retrospective | 1 giờ | 3 dòng: Tốt / Chưa tốt / Thay đổi gì — lưu trong Confluence hoặc `docs/retro/` |

## 6. Quy tắc

- Mọi thứ cần làm phải nằm trong Jira — kể cả "nhỏ" như nâng version dependency.
- Phát hiện việc mới giữa sprint → tạo ticket vào **Backlog**, không nhét vào sprint (trừ bug Blocker).
- Ticket đang làm mà phát hiện scope lớn hơn dự kiến → **tách ticket**, không âm thầm làm phình ra.
- Quyết định về sản phẩm/scope → ghi comment vào ticket, để 3 tháng sau còn biết vì sao.
