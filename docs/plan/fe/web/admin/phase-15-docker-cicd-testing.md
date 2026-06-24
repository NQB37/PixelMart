# Phase 15: Docker, CI/CD & E2E Testing - Container hóa & Tự động hóa kiểm thử Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai container hóa cho Admin Portal bằng Docker và Nginx, thiết lập CI/CD thông qua GitHub Actions và xây dựng các bộ kiểm thử tự động End-to-End (E2E) bằng Cypress để kiểm thử các luồng hoạt động chính.

**Architecture:** Sử dụng phương pháp xây dựng Docker đa tầng (Multi-stage build): tầng 1 chạy Node.js để biên dịch dự án Vite SPA thành các file tĩnh, tầng 2 copy các file tĩnh này vào máy chủ Nginx nhỏ gọn để phân phát (serve) tài nguyên. Nginx cấu hình fallback `try_files` để hỗ trợ cơ chế SPA routing của React Router. GitHub Actions cấu hình chạy kiểm thử tự động và build Docker image mỗi khi có PR. Cypress chạy các E2E tests mô phỏng hành động click của admin trên trình duyệt.

**Tech Stack:** Docker, Nginx, Cypress, GitHub Actions, Node.js.

## Global Constraints

- Thư mục làm việc: `web/admin-web/`
- Tệp cấu hình Nginx phải đảm bảo redirect tất cả các yêu cầu không khớp với file tĩnh về `index.html` (tránh lỗi 404 khi admin F5 tải lại trang ở các đường dẫn như `/admin/users`).
- Cypress phải kiểm thử thành công ít nhất hai kịch bản: Đăng nhập thành công và Thực hiện block/unblock người dùng.
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.

---

## 📋 Task Breakdown

### Task 15.1: Thiết lập Dockerfile & Cấu hình Nginx

**Files:**
- Create: `web/admin-web/Dockerfile`
- Create: `web/admin-web/nginx.conf`
- Create: `web/admin-web/.dockerignore`

**Interfaces:**
- Consumes: Static build assets của Vite (`web/admin-web/dist/`)
- Produces: Docker image hoạt động trên môi trường sản xuất với cấu hình Nginx tối ưu.

- [ ] **Step 1: Write the failing test**

*(Vì Docker build kiểm thử bằng CLI, test case thất bại của bước này là chưa thể tìm thấy file cấu hình hoặc container không thể khởi chạy)*
Run: `docker build -t pixelmart-admin-test web/admin-web/`
Expected: FAIL với lỗi không tìm thấy `Dockerfile` trong thư mục chỉ định.

- [ ] **Step 2: Run test to verify it fails**

*(Đã thực hiện ở Step 1, kết quả thất bại là chính xác do chưa viết file)*

- [ ] **Step 3: Write minimal implementation**

```dockerfile
# web/admin-web/Dockerfile
# Stage 1: Build React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# web/admin-web/nginx.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Cache static files
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        root /usr/share/nginx/html;
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

```
# web/admin-web/.dockerignore
node_modules
dist
.git
Dockerfile
nginx.conf
cypress
cypress.config.ts
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker build -t pixelmart-admin-test web/admin-web/`
Expected: PASS, Docker image được dựng thành công mà không có lỗi. Có thể chạy test container qua `docker run -d -p 8080:80 pixelmart-admin-test` và truy cập `http://localhost:8080` để kiểm tra.

- [ ] **Step 5: Commit**

```bash
git add web/admin-web/Dockerfile web/admin-web/nginx.conf web/admin-web/.dockerignore
git commit -m "feat(admin): dockerize admin portal using multi-stage build and nginx config"
```

---

### Task 15.2: Thiết lập CI Pipeline (GitHub Actions)

**Files:**
- Create: `.github/workflows/admin-ci.yml`

**Interfaces:**
- Consumes: Mọi commit đẩy lên GitHub branch `main` hoặc Pull Request liên quan đến thư mục `web/admin-web/`
- Produces: Pipeline chạy tự động: Kiểm tra định dạng (Linting) -> Chạy Unit test (Vitest) -> Biên dịch thử nghiệm (Vite Build).

- [ ] **Step 1: Write the failing test**

*(Tạo file CI nhưng cố tình làm sai syntax của GitHub Actions workflow để GitHub báo đỏ hoặc kiểm thử bằng công cụ linting local)*
Run: `npx action-validator .github/workflows/admin-ci.yml`
Expected: FAIL hoặc thông báo file trống/không tồn tại.

- [ ] **Step 2: Run test to verify it fails**

*(Đã thực hiện ở Step 1, kết quả báo lỗi do chưa có file cấu hình)*

- [ ] **Step 3: Write minimal implementation**

```yaml
# .github/workflows/admin-ci.yml
name: Admin Portal CI

on:
  push:
    branches: [ main ]
    paths:
      - 'web/admin-web/**'
      - '.github/workflows/admin-ci.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'web/admin-web/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: web/admin-web

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: web/admin-web/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint
        continue-on-error: false

      - name: Run Component Tests
        run: npm run test

      - name: Build Application
        run: npm run build
```

*(Lưu ý: Đảm bảo thêm script `"lint": "eslint src --ext .ts,.tsx"` vào `package.json` của `web/admin-web` nếu chưa có)*

- [ ] **Step 4: Run test to verify it passes**

Run: Đẩy code lên GitHub branch và tạo PR, kiểm tra tab "Actions" của GitHub repository.
Expected: PASS, tất cả các stage (Lint, Test, Build) trên máy chủ ảo GitHub runner báo màu xanh lá.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/admin-ci.yml
git commit -m "ci(admin): establish GitHub Actions workflow for linting, testing, and building"
```

---

### Task 15.3: Cài đặt Kiểm Thử E2E tự động bằng Cypress

**Files:**
- Create: `web/admin-web/cypress.config.ts`
- Create: `web/admin-web/cypress/support/e2e.ts`
- Create: `web/admin-web/cypress/e2e/admin_flow.cy.ts`
- Modify: `web/admin-web/package.json` (thêm dependencies cypress & script chạy test)

**Interfaces:**
- Consumes: React App chạy trên localhost (Dev server hoặc Docker container) và Mock backend endpoints
- Produces: Trình duyệt Chromium/Electron chạy tự động để kiểm chứng quy trình đăng nhập và tương tác quản lý của Admin.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/cypress/e2e/admin_flow.cy.ts
describe('Admin Portal E2E Flow', () => {
  it('allows logging in and toggling a user block status', () => {
    cy.visit('/admin/login');
    cy.get('input[name="email"]').type('admin@pixelmart.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify dashboard displays
    cy.url().should('include', '/admin');
    cy.contains('Admin Dashboard').should('be.visible');

    // Go to users management
    cy.get('a').contains('Users').click();
    cy.url().should('include', '/admin/users');
    
    // Toggle first user's block status
    cy.contains('button', 'Block').first().click();
    cy.contains('button', 'Unblock').should('be.visible');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npx cypress run --spec cypress/e2e/admin_flow.cy.ts`
Expected: FAIL do Cypress chưa được cài đặt hoặc dev server chưa khởi chạy.

- [ ] **Step 3: Write minimal implementation**

Cập nhật package.json của `web/admin-web` để thêm script và devDependencies:
```json
// Thêm vào "scripts"
"cypress:open": "cypress open",
"cypress:run": "cypress run"
```
Cài đặt cypress qua CLI: `npm install -D cypress`

```typescript
// web/admin-web/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

```typescript
// web/admin-web/cypress/support/e2e.ts
// Import commands.js using ES2015 syntax:
import './commands';
```

Tạo file trống `web/admin-web/cypress/support/commands.ts` để tránh lỗi import:
```typescript
// web/admin-web/cypress/support/commands.ts
// Place custom Cypress commands here (empty for now)
```

- [ ] **Step 4: Run test to verify it passes**

Khởi động ứng dụng React dev server: `npm run dev` ở terminal 1.
Chạy test Cypress: `npm run cypress:run` ở terminal 2.
Expected: PASS, Cypress tự động hóa các hành động nhập form, chuyển hướng, click menu, click nút block người dùng và kết luận pass 100%.

- [ ] **Step 5: Commit**

```bash
git add web/admin-web/cypress.config.ts web/admin-web/cypress/ web/admin-web/package.json
git commit -m "test(admin): install cypress and build core end-to-end admin user flows"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Lệnh `docker build` thành công, image Nginx chạy nhẹ và tải trang cực nhanh.
- [ ] F5 reload lại trang con trong môi trường Docker không bị lỗi 404 (chứng tỏ `try_files` ở nginx.conf chạy tốt).
- [ ] File CI `.github/workflows/admin-ci.yml` kiểm tra định dạng và unit test tự động hoàn thành không có cảnh báo đỏ.
- [ ] Chạy `npm run cypress:run` chạy mượt mà, ghi hình (video) các thao tác login/block người dùng không lỗi.

### ⚠️ Lỗi Fresher hay mắc
1. **Thiếu `try_files $uri $uri/ /index.html` trong Nginx:** Lỗi này làm cho SPA hoạt động bình thường khi đi từ trang chủ, nhưng khi người dùng reload trang (F5) ở route `/admin/shops`, Nginx sẽ tìm thư mục vật lý `/admin/shops` trên ổ đĩa và trả về lỗi 404.
2. **Không cache `node_modules` trong GitHub Actions:** Làm cho thời gian chạy CI kéo dài từ 2 phút lên hơn 10 phút do mỗi lần build phải download lại toàn bộ node modules từ NPM registry.
3. **Cypress test bị treo do gọi API thật:** Khi viết E2E test, nếu database thay đổi liên tục hoặc API thật bị lỗi mạng, test sẽ fail ngẫu nhiên (flaky tests). Hãy cân nhắc sử dụng `cy.intercept()` để mock API backend trong E2E nếu muốn kiểm thử độc lập hoàn toàn.
