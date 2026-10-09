# PixelMart — Sprint Plan v1

- Jira project: **PixelMart**, key **`PXM`** (Scrum, team-managed) — https://nquocbao37.atlassian.net/jira/software/projects/PXM/boards/134
- Epics: PXM-1 Platform & DevOps · PXM-2 Identity & Auth · PXM-3 Catalog · PXM-4 Storefront & Cart · PXM-5 Checkout & Orders · PXM-6 Release v1.0
- Lịch dự kiến: Sprint 1 bắt đầu 12/10/2026; nghỉ 21/12 – 03/01; Sprint 7 kết thúc 31/01/2027
- Sprint: 2 tuần · Capacity: 6–8 giờ/tuần ≈ **9–10 story points/sprint** (1 pt ≈ 1,5 giờ — sẽ hiệu chỉnh sau Sprint 2 bằng velocity thật)
- Tổng v1: **68 pts · 7 sprint ≈ 14 tuần**

> **Thay đổi so với blueprint (6 sprint):** khi estimate từng ticket, tổng là ~68 pts — nhồi vào 6 sprint sẽ vượt capacity ~20%. Ta tách thành 7 sprint thay vì cắt scope. Đây đúng là việc team thật làm ở planning: **estimate xong mới cam kết timeline, không làm ngược lại.**

## Epics

| Epic | Phạm vi | Sprint |
|---|---|---|
| **Platform & DevOps** | Monorepo, CI/CD, Docker, DB, observability, error format | 1–2 |
| **Identity & Auth** | Register/login, JWT + refresh rotation, guards, UI đăng nhập | 3–4 |
| **Catalog** | Category/Product API + admin UI | 4–5 |
| **Storefront & Cart** | Landing, list, detail, giỏ hàng | 5–6 |
| **Checkout & Orders** | Tạo đơn, PaymentProvider, đơn của tôi, admin xác nhận | 6–7 |
| **Release v1.0** | Security hardening, polish, docs, release | 7 |

## Lộ trình

| Sprint | Version | Sprint Goal | Pts |
|---|---|---|---|
| [1](sprint-01.md) | v0.1.0 | Monorepo + API & web hello-world tự deploy lên domain thật | 11 |
| [2](sprint-02.md) | v0.2.0 | DB + migration trong pipeline, admin shell online, lỗi chuẩn hóa + Sentry | 10 |
| [3](sprint-03.md) | v0.3.0 | Auth API hoàn chỉnh (JWT + refresh rotation + phân quyền), có integration test | 10 |
| [4](sprint-04.md) | v0.4.0 | Đăng nhập trên shop & admin; API category/product sẵn sàng | 10 |
| [5](sprint-05.md) | v0.5.0 | Admin quản lý catalog; khách duyệt landing/list/detail | 10 |
| [6](sprint-06.md) | v0.6.0 | Giỏ hàng, checkout, đơn hàng của tôi | 9 |
| [7](sprint-07.md) | **v1.0.0** | Admin xác nhận đơn, hardening, phát hành v1.0 | 8 |

## Quy ước trong các file sprint

- Mã tạm `S1-01` = Sprint 1, ticket 01. Sau khi tạo trên Jira, cột **Jira** trong bảng dưới được điền key thật.
- Type: `Story` (có giá trị trực tiếp cho người dùng) / `Task` (kỹ thuật).
- Sprint 4–7 là bản **draft**: refine lại AC ở buổi refinement giữa sprint trước (xem `docs/rules/04-sprint-lifecycle.md`).

## Mapping Jira

| Mã | Jira | Mã | Jira | Mã | Jira |
|---|---|---|---|---|---|
| S1-01 | PXM-7 | S3-01 | PXM-21 | S5-01 | PXM-31 |
| S1-02 | PXM-8 | S3-02 | PXM-22 | S5-02 | PXM-32 |
| S1-03 | PXM-9 | S3-03 | PXM-23 | S5-03 | PXM-33 |
| S1-04 | PXM-10 | S3-04 | PXM-24 | S5-04 | PXM-34 |
| S1-05 | PXM-11 | S3-05 | PXM-25 | S5-05 | PXM-35 |
| S1-06 | PXM-12 | S4-01 | PXM-26 | S6-01 | PXM-36 |
| S1-07 | PXM-13 | S4-02 | PXM-27 | S6-02 | PXM-37 |
| S2-01 | PXM-14 | S4-03 | PXM-28 | S6-03 | PXM-38 |
| S2-02 | PXM-15 | S4-04 | PXM-29 | S6-04 | PXM-39 |
| S2-03 | PXM-16 | S4-05 | PXM-30 | S7-01 | PXM-40 |
| S2-04 | PXM-17 | | | S7-02 | PXM-41 |
| S2-05 | PXM-18 | | | S7-03 | PXM-42 |
| S2-06 | PXM-19 | | | S7-04 | PXM-43 |
| S2-07 | PXM-20 | | | S7-05 | PXM-44 |
