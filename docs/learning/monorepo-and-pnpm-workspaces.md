# Monorepo và pnpm Workspaces

## 1. Nó là gì
**Monorepo** là một git repository chứa nhiều dự án liên quan. Trong PixelMart đó là app Next.js (`apps/web`) và API NestJS (`apps/api`). **pnpm workspaces** là tính năng của pnpm coi mỗi thư mục đó là một package riêng, đồng thời cài đặt và liên kết chúng với nhau từ thư mục gốc của repository.

## 2. Tại sao nó tồn tại
Các dự án liên quan thường thay đổi cùng nhau. Nếu tách thành nhiều repository, bạn phải phối hợp nhiều pull request, lặp lại cấu hình công cụ, và dễ bị lệch phiên bản giữa "API mà frontend mong đợi" và "API đang thực sự tồn tại".

## 3. Vấn đề nó giải quyết
- Một lần `git clone`, một lần `pnpm install`, một lockfile.
- Một commit có thể sửa API và trang dùng API đó cùng lúc (thay đổi nguyên tử).
- Code dùng chung (sau này: `packages/contracts`) được dùng như một package local, không cần bước publish.
- Dependency chỉ lưu một lần trên đĩa (content-addressable store) rồi được liên kết vào từng dự án.

## 4. Ví dụ đời thực
Một bếp nhà hàng có nhiều khu riêng (nướng, bánh ngọt) dưới cùng một mái nhà và chung một kho nguyên liệu. Mỗi khu có công thức riêng (package.json), nhưng dùng chung kho (pnpm store), và bếp trưởng có thể đổi thực đơn của mọi khu trong một lần (atomic commit).

## 5. Cách hoạt động (mức cơ bản)
- `pnpm-workspace.yaml` liệt kê các glob pattern (`apps/*`) trỏ tới những thư mục có `package.json`.
- `pnpm install` ở thư mục gốc đọc mọi package trong workspace, resolve toàn bộ dependency **một lần**, và ghi ra một file `pnpm-lock.yaml` duy nhất.
- Package được lưu trong một store toàn cục. `node_modules` của từng dự án chứa các **liên kết** vào store đó. pnpm dùng cấu trúc nghiêm ngặt: một dự án chỉ `import` được những gì nó khai báo trong `package.json` của chính nó. Cấu trúc phẳng của npm thường vô tình cho bạn import cả những package không khai báo ("phantom dependency").
- `pnpm --filter api <script>` chạy script trong một package. `pnpm -r <script>` chạy trong tất cả.
- Một package có thể phụ thuộc vào package anh em bằng `"@pixelmart/contracts": "workspace:*"`.

## 6. Khi nào nên dùng
Khi có nhiều dự án JS/TS được phát triển cùng nhau, dùng chung type hoặc công cụ, và do cùng một team sở hữu.

## 7. Khi nào không nên dùng
- Các dự án không liên quan, có chủ sở hữu và chu kỳ release khác nhau.
- Tổ chức rất lớn mà không có công cụ cho monorepo (build cache, CI chỉ chạy phần bị ảnh hưởng). Thiếu chúng, thời gian CI tăng theo kích thước repo. Turborepo/Nx sinh ra để giải quyết việc đó. Ta chưa cần tới.

## 8. Vị trí trong PixelMart
Thư mục gốc = nơi điều phối workspace (script, cấu hình định dạng dùng chung, Docker Compose). `apps/web` và `apps/api` là hai app độc lập, build và deploy riêng. `packages/*` **chỉ** được tạo khi có code dùng chung thực sự (quyết định ở V1.5). Xem [ADR-0001](../decisions/0001-modular-monolith-pnpm-monorepo.md).

## 9. Bài tập thực hành
Sau khi có V1.2: chạy `pnpm --filter api add dayjs`, rồi xem `apps/api/package.json` và `pnpm-lock.yaml` ở thư mục gốc. Giờ thử `import dayjs` từ `apps/web` và quan sát lỗi. Đó chính là cấu trúc nghiêm ngặt đang bảo vệ bạn khỏi phantom dependency. Gỡ lại bằng `pnpm --filter api remove dayjs`.

## 10. Lỗi thường gặp và cách debug
- Chạy `pnpm add x` ở thư mục gốc thay vì dùng `--filter <app>`: pnpm cảnh báo hoặc cài vào gốc. Dependency ở gốc chỉ nên là công cụ dev dùng cho cả repo.
- Dùng lẫn npm/yarn với pnpm: bạn sẽ có hai lockfile và hai cây dependency khác nhau. Trường `packageManager` cùng Corepack hoặc pnpm đã cài sẽ ngăn chuyện này.
- Không commit `pnpm-lock.yaml`: đồng đội và CI sẽ cài các phiên bản khác nhau.
- "Module not found" với một package đã được cài ở chỗ khác trong repo: nó chưa được khai báo trong `package.json` của *chính* package này.

## 11. Câu hỏi phỏng vấn
- **Tại sao ở đây chọn monorepo thay vì polyrepo?** Một team, web và api gắn chặt với nhau, thay đổi nguyên tử, công cụ dùng chung. Đánh đổi là CI khó scale và ranh giới dễ mờ, được xử lý bằng filter và kỷ luật module.
- **Phantom dependency là gì?** Import một package bạn không khai báo, chỉ chạy được nhờ hoisting. `node_modules` nghiêm ngặt của pnpm ngăn điều này.
- **Lockfile đảm bảo điều gì?** Cài đặt tái lập được: đúng phiên bản đã resolve và integrity hash cho toàn bộ cây dependency.

## 12. Tài liệu tham khảo
- pnpm workspaces: https://pnpm.io/workspaces
- pnpm filtering: https://pnpm.io/filtering
- Trường `packageManager` / Corepack: https://nodejs.org/api/corepack.html
