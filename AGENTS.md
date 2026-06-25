# PixelMart Developer Agent Guidelines

Tài liệu này định nghĩa các nguyên tắc bắt buộc cho mọi AI Agent khi làm việc trong codebase PixelMart. Tất cả các sửa đổi, cấu trúc thư mục, phong cách giao diện và cách thức giao tiếp phải tuân thủ nghiêm ngặt các quy định dưới đây.

---

## 1. Hành vi & Tư duy lập trình (Behavioral Principles)

### 1.1. Suy nghĩ trước khi Code (Think Before Coding)
* **Không tự suy diễn**: Luôn làm rõ các giả định của bạn một cách rõ ràng. Nếu yêu cầu của người dùng mơ hồ hoặc có nhiều cách hiểu, hãy đưa ra các lựa chọn và hỏi ý kiến trước khi thực hiện.
* **Đề xuất giải pháp tối giản**: Trước khi bắt đầu viết code phức tạp, hãy đánh giá xem có cách giải quyết đơn giản hơn không. Nếu có, hãy đề xuất với người dùng trước.
* **Dừng lại khi không rõ ràng**: Nếu có bất kỳ điểm nào trong logic nghiệp vụ hoặc cấu trúc dự án chưa rõ, hãy dừng lại và đặt câu hỏi. Không được tự ý đưa ra quyết định ngầm.

### 1.2. Đơn giản là trên hết (Simplicity First)
* **Chỉ viết những gì được yêu cầu**: Không bổ sung các tính năng suy đoán (speculative features), các lớp trừu tượng (abstractions) cho code chỉ dùng một lần, hoặc các cấu hình linh hoạt không cần thiết.
* **Tối giản hóa số dòng code**: Trước khi hoàn thành, hãy tự hỏi: "Liệu đoạn code này có thể viết ngắn gọn hơn mà vẫn đảm bảo tính đúng đắn và dễ đọc không?". Tránh lạm dụng boilerplate.
* **Không tự bắt lỗi không thể xảy ra**: Chỉ xử lý các kịch bản lỗi thực tế và có ý nghĩa đối với trải nghiệm người dùng hoặc hệ thống.

### 1.3. Sửa đổi có tính khu trú (Surgical Changes)
* **Không làm phiền code xung quanh**: Chỉ chạm vào những file và dòng code cần thiết để thực hiện tính năng. Không tự ý định dạng lại (reformat), sửa comment hoặc tối ưu hóa code lân cận nếu chúng không bị lỗi.
* **Đồng bộ phong cách viết**: Viết code theo đúng phong cách hiện có của file (naming convention, tab/space, syntax style), kể cả khi bạn không đồng tình với phong cách đó.
* **Dọn dẹp tài nguyên thừa do chính mình tạo ra**: Nếu sửa đổi của bạn làm cho một import, biến hoặc hàm trở nên dư thừa (unused), hãy xóa nó. Tuyệt đối không xóa code thừa có sẵn trước đó của người dùng trừ khi được yêu cầu.

### 1.4. Thực thi hướng mục tiêu (Goal-Driven Execution)
* **Định nghĩa tiêu chí thành công rõ ràng**: Chuyển đổi các yêu cầu tính năng thành các mục tiêu có thể kiểm chứng (ví dụ: validation schema hoạt động với đầu vào lỗi, route API trả về đúng format dữ liệu).
* **Lập kế hoạch trước khi làm**: Đối với các tác vụ có nhiều bước, hãy viết ra danh sách công việc (`task.md`) và cập nhật trạng thái thực hiện (`[ ]`, `[/]`, `[x]`) liên tục.
* **Kiểm tra trước khi hoàn thành**: Luôn chạy thử code, build thử hoặc chạy linter/tests nếu có trước khi thông báo hoàn thành công việc.

---

## 2. Kiến trúc & Quy chuẩn mã nguồn PixelMart (Technical Architecture)

Dự án PixelMart là một hệ thống thương mại điện tử phong cách Retro Game, bao gồm các thành phần sau:
* **website/client**: Dự án Next.js App Router (Frontend)
* **server**: Dự án Express.js & Prisma ORM (Backend)
* **mobile**: Ứng dụng di động (TBD - hiện đang để trống)

### 2.1. Quy chuẩn Frontend (`website/client`)
* **Công nghệ cốt lõi**: Next.js (App Router), TypeScript, TailwindCSS v4, Zustand (quản lý state nội bộ), TanStack React Query v5 (quản lý state server/API fetching), Axios.
* **Quy tắc thư mục (Feature-based structure)**:
  * Toàn bộ logic nghiệp vụ theo tính năng phải được gom vào thư mục [website/client/features/`[feature_name]`](file:///home/nquocbao37/Code/PixelMart/website/client/features).
  * Mỗi thư mục feature phải có cấu trúc con rõ ràng:
    * `components/`: Các component giao diện cụ thể của feature đó.
    * `hooks/`: Custom hooks phục vụ cho feature (ví dụ: hooks fetch data với React Query).
    * `schemas/`: Zod schemas định nghĩa kiểu dữ liệu và validate form.
    * `services/`: Axios API calls kết nối với backend.
  * Các component dùng chung cho toàn dự án nằm ở [website/client/components/shared](file:///home/nquocbao37/Code/PixelMart/website/client/components/shared) hoặc thư mục UI dùng chung.
* **Quy tắc quản lý trạng thái**:
  * Trạng thái UI toàn cục: Dùng Zustand.
  * Trạng thái dữ liệu từ API: Dùng React Query. Không được lưu trữ thủ công dữ liệu API trong Zustand hay useState toàn cục.

### 2.2. Quy chuẩn Backend (`server`)
* **Công nghệ cốt lõi**: Express.js (v5), TypeScript, Prisma ORM, PostgreSQL, Zod (validation).
* **Quy tắc thư mục (Module-based structure)**:
  * Logic nghiệp vụ được chia theo module nằm trong [server/src/modules/`[module_name]`](file:///home/nquocbao37/Code/PixelMart/server/src/modules).
  * Mỗi module phải bao gồm các file chuyên biệt:
    * `*.controller.ts`: Nhận request, gọi service xử lý và trả về response.
    * `*.routes.ts`: Định nghĩa các endpoints, gán middleware và validate schema.
    * `*.service.ts`: Xử lý logic nghiệp vụ chính và thao tác với Database qua Prisma.
    * `*.validation.ts`: Định nghĩa schema Zod dùng để validate đầu vào request body/query/params.
  * Các cấu trúc dùng chung: Middleware nằm trong `server/src/middlewares`, cấu hình trong `server/src/config`, util trong `server/src/utils`.
* **Xử lý lỗi**:
  * Luôn sử dụng lớp `ApiError` (`server/src/utils/ApiError.ts`) để ném ra các lỗi HTTP (ví dụ: `ApiError.badRequest()`, `ApiError.notFound()`).
  * Tất cả các lỗi phải được chuyển tiếp đến `errorHandler` middleware bằng cách gọi `next(error)`.

---

## 3. Quy chuẩn giao diện Retro/Pixel (Aesthetics & Design Guidelines)

PixelMart được thiết kế theo chủ đề **Retro Game (8-bit / Arcade / Cyberpunk)**. Mọi giao diện phát triển mới hoặc chỉnh sửa đều phải tuân thủ nghiêm ngặt tính thẩm mỹ này.

* **Kiểu chữ (Typography)**:
  * Luôn dùng font chữ retro phù hợp. Các class chính: `font-pixel` (cho tiêu đề, các nút hành động ngắn, điểm số) và `font-retro` (cho văn bản mô tả, form).
* **Đường viền và Khung viền (Pixel Borders)**:
  * Tránh các đường viền mượt dạng bo tròn tròn hiện đại (`rounded-lg`, `rounded-full`).
  * Sử dụng các border vuông vức mang phong cách retro: `pixel-border`, `pixel-border-pink`, `pixel-border-yellow`, v.v.
* **Bảng màu và Hiệu ứng Glow**:
  * Dùng các gam màu neon tương phản cao: neon pink (`text-neon-pink`, `bg-neon-pink`), neon cyan (`text-neon-cyan`, `bg-neon-cyan`), neon green (`text-neon-green`), neon yellow.
  * Sử dụng các hiệu ứng phát sáng (glow) đặc trưng: `glow-pink`, `glow-cyan`, `scanlines`, `retro-grid`.
* **Các nút hành động (Buttons)**:
  * Không dùng button phẳng thông thường. Luôn dùng component `PixelButton` từ `@/components/shared/PixelButton`.
* **Không dùng nội dung giả (No Placeholders)**:
  * Nếu cần hiển thị ảnh sản phẩm hoặc avatar game, hãy yêu cầu hệ thống generate hoặc dùng asset thực tế, không dùng placeholder màu xám trơn.

---

## 4. Cơ sở dữ liệu & Quy trình Migrations (Database Workflow)

* **Quản lý Schema**: Cơ sở dữ liệu PostgreSQL được định nghĩa thông qua file [server/prisma/schema.prisma](file:///home/nquocbao37/Code/PixelMart/server/prisma/schema.prisma).
* **Quy trình thay đổi cơ sở dữ liệu**:
  1. Chỉnh sửa file `schema.prisma`.
  2. Tạo migration mới bằng lệnh: `pnpm prisma migrate dev --name <migration_name>` (chạy bên trong thư mục `server`).
  3. Lệnh này sẽ tự động sinh mã types cho Prisma client. Nếu cần tạo lại type thủ công, chạy `pnpm prisma generate`.
* **Tuyệt đối không**:
  * Không sửa đổi database trực tiếp bằng các công cụ GUI mà không thông qua Prisma schema.
  * Không thay đổi schema mà không tạo migration.

---

## 5. Bản đồ câu lệnh (Commands Reference)

Hãy luôn chạy các câu lệnh từ đúng thư mục làm việc (`Cwd`).

* **Client (Frontend)**:
  * Thư mục làm việc: `website/client`
  * Chạy Dev: `pnpm dev`
  * Build dự án: `pnpm build`
  * Kiểm tra Lint: `pnpm lint`
* **Server (Backend)**:
  * Thư mục làm việc: `server`
  * Chạy Dev: `pnpm dev`
  * Chạy Migration: `pnpm prisma migrate dev`
  * Tạo Prisma Client: `pnpm prisma generate`
  * Kiểm tra Lint: `pnpm lint`
  * Sửa lỗi Lint tự động: `pnpm lint:fix`
