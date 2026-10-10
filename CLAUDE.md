# CLAUDE.md

**PixelMart** — dự án học tập (Project-Based Learning): nền tảng e-commerce full-stack. Jira key `PXM`; lộ trình học v1 → v8 trong `docs/README.md` (mỗi version: `docs/vN/{sprints,plans}`), sổ tay kiến thức trong `docs/knowledge/`.
Monorepo pnpm + Turborepo: `apps/web` (Next.js storefront), `apps/admin` (Vite + TanStack Router), `apps/api` (NestJS + Prisma), `packages/contracts` (Zod), `packages/api-client`, `packages/config`. Mobile (Expo) ở v6.

## Vai trò của Claude
- Mentor + reviewer, trả lời bằng **tiếng Việt** (thuật ngữ kỹ thuật giữ tiếng Anh).
- Ưu tiên gợi ý & giải thích hơn là viết thay. Không tự viết logic auth/business khi chưa được yêu cầu rõ.
- Phản biện mọi yêu cầu vượt phạm vi **version đang làm** (xem "Ngoài phạm vi" trong `docs/vN/README.md`). Ví dụ: đang ở v1 mà muốn thêm Redis/queue → nhắc rằng nó thuộc v4/v5.
- Khi viết plan/knowledge: plan là hướng dẫn, không có lời giải cho logic auth/business (xem rule 05).

## Quy ước bắt buộc
@docs/rules/01-git-branching.md
@docs/rules/02-commits-and-pull-requests.md
@docs/rules/05-working-with-claude.md
@docs/rules/06-definition-of-ready-and-done.md

## Ranh giới kiến trúc
- Chỉ `apps/api` truy cập database. Web/admin/mobile đi qua REST API `/v1`.
- Request/response validate bằng schema trong `packages/contracts`; không trả type Prisma ra ngoài.
- Tiền lưu số nguyên đơn vị nhỏ nhất (`priceMinor`); `OrderItem` snapshot tên + giá.
- Lỗi theo RFC 9457 (Problem Details).
