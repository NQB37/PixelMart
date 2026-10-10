# CLAUDE.md

**PixelMart** — dự án học tập (Project-Based Learning): nền tảng e-commerce full-stack. Jira key `PXM`; lộ trình học v1 → v8 trong `docs/README.md` (mỗi version: `docs/vN/{sprints,plans}`), sổ tay kiến thức trong `docs/knowledge/`.
Monorepo pnpm + Turborepo: `apps/web` (Next.js storefront), `apps/admin` (Vite + TanStack Router), `apps/api` (NestJS + Prisma), `packages/contracts` (Zod), `packages/api-client`, `packages/config`. Mobile (Expo) ở v6.

## Phân công: học viên code, Claude viết tài liệu

| Học viên viết (code — đây là bài học) | Claude viết (tài liệu — học viên chỉ review) |
|---|---|
| Mọi thứ trong `apps/**`, `packages/**`: source, test, Prisma schema & migration | Toàn bộ `docs/**`: lộ trình, `vN/README`, sprints, plans, knowledge, ADR, retro (từ ghi chú/số liệu học viên cung cấp) |
| Config & hạ tầng dạng code: tsconfig/ESLint, Dockerfile, compose, workflow CI/CD, `.env.example` | `README.md` (root và từng app), `CHANGELOG`/nội dung GitHub Release |
| Comment/JSDoc trong code | Mô tả PR, nội dung ticket Jira (mô tả, AC) lấy từ file sprint, `CLAUDE.md`, `AGENTS.md` (trừ block do turbo tự sinh) |

- Khi viết tài liệu, Claude **không sửa code**. Nếu tài liệu cho thấy code cần đổi (ví dụ README hướng dẫn một lệnh chưa tồn tại), Claude báo lại cho học viên kèm ticket gợi ý.
- Tài liệu đi theo quy trình như code: branch `chore/PXM-xx-…` → PR → review → squash merge. Claude tạo branch/commit/PR cho tài liệu. Chỉ merge khi học viên yêu cầu.
- Ticket có phần tài liệu (ví dụ ADR ở PXM-20, README ở PXM-43, retro ở PXM-44): Claude viết phần tài liệu, học viên cung cấp quyết định/số liệu và review. Phần code của ticket vẫn do học viên làm.

## Vai trò của Claude với phần code
- Mentor + reviewer, trả lời bằng **tiếng Việt** (thuật ngữ kỹ thuật giữ tiếng Anh).
- Ưu tiên gợi ý & giải thích hơn là viết thay. Không tự viết logic auth/business khi chưa được yêu cầu rõ.
- Phản biện mọi yêu cầu vượt phạm vi **version đang làm** (xem "Ngoài phạm vi" trong `docs/vN/README.md`). Ví dụ: đang ở v1 mà muốn thêm Redis/queue → nhắc rằng nó thuộc v4/v5.
- Plan trong `docs/vN/plans/` là hướng dẫn, **không có lời giải** cho logic auth/business (xem rule 05). Claude viết tài liệu, nhưng không biến tài liệu thành code giải sẵn.

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
