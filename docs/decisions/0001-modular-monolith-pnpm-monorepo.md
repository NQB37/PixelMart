# ADR-0001: Modular monolith trong một pnpm monorepo

- Trạng thái: Accepted (Đã chấp nhận)
- Ngày: 2026-10-15

## Bối cảnh

PixelMart do một người học xây dựng, chưa có người dùng, và người mới bắt đầu phải debug được. Dự án cần một frontend (Next.js) và một backend (NestJS) thường xuyên thay đổi cùng nhau.

## Các phương án đã cân nhắc

1. **Microservices ngay từ ngày đầu.** Mỗi service deploy độc lập được, nhưng kéo theo lỗi mạng, distributed transaction, service discovery, và chi phí deploy lẫn debug nhân lên N lần. Nó giải quyết các vấn đề về scale và tổ chức team mà ta chưa gặp.
2. **Hai repository riêng (web, api).** Tách biệt rõ ràng, nhưng mọi thay đổi xuyên suốt cần hai PR, phiên bản dễ lệch nhau, và cấu hình công cụ dùng chung bị nhân đôi.
3. **Một monorepo, hai app, backend là modular monolith.** Được chọn.

## Quyết định

- Một git repository, quản lý bằng **pnpm workspaces** (`apps/web`, `apps/api`, sau này thêm `packages/*` chỉ khi việc dùng chung code là hợp lý).
- Backend là **một ứng dụng NestJS deploy như một khối**, chia thành các module theo tính năng (`catalog`, `orders`, `auth`, …) với ranh giới rõ ràng. Các module giao tiếp qua service được export, không truy cập database của nhau một cách tùy tiện.

## Hệ quả

- ➕ Một lần clone, một lần install, commit nguyên tử (atomic) cho cả web và api, một CI pipeline.
- ➕ Các module gọi nhau trong cùng process: không có lỗi mạng, và DB transaction thật có thể trải qua nhiều module.
- ➖ Web và api deploy riêng nhưng chung phiên bản. Thay đổi API gây phá vỡ (breaking change) phải được phối hợp. Chấp nhận được vì cả hai nằm chung một repo.
- ➖ Ranh giới được giữ bằng kỷ luật và code review, không phải bằng mạng. Khi review phải bắt được việc module này với vào phần nội bộ của module khác.
- **Tín hiệu cho thấy nên tách một service ra sau này:** một module cần cách scale rất khác (ví dụ search), một team riêng sở hữu nó, nó cần nhịp release hoặc tech stack khác, hoặc lỗi của nó phải được cô lập khỏi checkout. Ở V1 chưa có tín hiệu nào.
