# Phase 15: Dockerization, CI/CD & Playwright Testing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Docker hóa ứng dụng Next.js client phục vụ deploy production, tích hợp GitHub Actions CI tự động chạy lint/build, và triển khai bộ kiểm thử tự động E2E bằng Playwright.

**Architecture:** Sử dụng kỹ thuật Multi-stage Dockerfile kết hợp với tính năng `output: 'standalone'` của Next.js giúp giảm dung lượng image của Node.js container chỉ còn dưới 150MB. File workflow của GitHub Actions lắng nghe sự kiện push/PR để kích hoạt bộ build kiểm thử. Playwright được cấu hình chạy headless test luồng đăng nhập của người dùng.

**Tech Stack:** Docker, GitHub Actions, Playwright.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. App chưa có Dockerfile, workflow CI, hay Playwright.

## Global Constraints

- Client web portal is located at `website/client/`
- Tech Stack: Next.js 16 (App Router), React 19, Tailwind CSS (v4), TypeScript, Zustand
- No placeholder code in the plan: write actual implementations, imports, types, test cases, and commands.
- Use Vietnamese for descriptions and explanations, and English for code and commands.
- TDD workflow is mandatory for tasks: Step 1 write failing test, Step 2 run to fail, Step 3 minimal implementation, Step 4 run to pass, Step 5 git commit.

---

### Task 15.1: Multi-stage Dockerfile with Standalone Build Output

**Files:**
- Create: `website/client/Dockerfile`, `website/client/.dockerignore`
- Modify: `website/client/next.config.ts`
- Test: `website/client/tests/docker-config.test.ts`

**Interfaces:**
- Consumes: Next.js build bundle
- Produces: Docker image chạy Next.js tối ưu và file `.dockerignore` loại bỏ node_modules cồng kềnh.

- [ ] **Step 1: Write the failing test**
Tạo file test xác nhận config output standalone đã được khai báo trong next.config.ts:
Create: `website/client/tests/docker-config.test.ts`
```typescript
import nextConfig from '../next.config';

describe('Next.js Docker Production Config', () => {
  it('must enable standalone output mode for docker container execution', () => {
    expect(nextConfig.output).toBe('standalone');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do config `output: 'standalone'` chưa được định nghĩa trong `next.config.ts`.

- [ ] **Step 3: Write minimal implementation**
Cập nhật config output trong `website/client/next.config.ts`:
Modify: `website/client/next.config.ts` (Target the NextConfig attributes)
Replace with:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

Tạo file `website/client/.dockerignore`:
Create: `website/client/.dockerignore`
```dockerignore
node_modules
.next
out
build
Dockerfile
.dockerignore
.git
.github
```

Tạo Dockerfile cho `client`:
Create: `website/client/Dockerfile`
```dockerfile
# Stage 1: Build source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Runner container
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS docker-config.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add next.config.ts Dockerfile .dockerignore tests/docker-config.test.ts
git commit -m "feat(client): add Dockerfile configurations and set standalone nextjs output mode"
```

---

### Task 15.2: GitHub Actions CI workflow config for Client Portal

**Files:**
- Create: `.github/workflows/client-ci.yml`
- Test: `.github/workflows/tests/ci-syntax.test.js`

**Interfaces:**
- Consumes: Push events on master branch
- Produces: GitHub CI runner build pipeline.

- [ ] **Step 1: Write the failing test**
Tạo script test kiểm thử cú pháp YAML của file GitHub Action:
Create: `.github/workflows/tests/ci-syntax.test.js`
```javascript
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

try {
  const filePath = path.join(__dirname, '../client-ci.yml');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(fileContent);
  if (data.name !== 'Client Portal Web CI') {
    throw new Error('Name mismatch in workflow file');
  }
  console.log('✅ YAML Syntax test passed!');
} catch (e) {
  console.error('❌ YAML Syntax verification failed:', e.message);
  process.exit(1);
}
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
node /home/nquocbao37/Code/PixelMart/.github/workflows/tests/ci-syntax.test.js
```
Expected: FAIL do chưa tạo thư mục workflows và file `client-ci.yml`.

- [ ] **Step 3: Write minimal implementation**
Cài đặt thư viện parse YAML phục vụ kiểm thử:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart
pnpm add -D js-yaml
```

Tạo file workflow `.github/workflows/client-ci.yml`:
Create: `/home/nquocbao37/Code/PixelMart/.github/workflows/client-ci.yml`
```yaml
name: Client Portal Web CI

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install dependencies
        run: |
          cd web
          pnpm install

      - name: Lint check
        run: |
          cd website/client
          pnpm run lint --pass-with-no-tests

      - name: Run unit test suite
        run: |
          cd website/client
          ppnpm test
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
node /home/nquocbao37/Code/PixelMart/.github/workflows/tests/ci-syntax.test.js
```
Expected: PASS ci-syntax.test.js

- [ ] **Step 5: Commit**
Run:
```bash
git add .github/workflows/client-ci.yml .github/workflows/tests/ci-syntax.test.js
git commit -m "ci(github): establish GitHub Actions workflow automation for client portal"
```

---

### Task 15.3: Playwright End-to-End Test Script

**Files:**
- Create: `website/client/playwright.config.ts`, `website/client/e2e/auth-flow.spec.ts`
- Test: `website/client/tests/playwright-config.test.ts`

**Interfaces:**
- Consumes: Playwright testing API
- Produces: Test script chạy E2E login/logout trên browser.

- [ ] **Step 1: Write the failing test**
Tạo file test kiểm định config của Playwright:
Create: `website/client/tests/playwright-config.test.ts`
```typescript
import playwrightConfig from '../playwright.config';

describe('Playwright Configuration', () => {
  it('should target local dev server port 3000 as webServer base URL', () => {
    expect(playwrightConfig.use?.baseURL).toBe('http://localhost:3000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: FAIL do chưa tạo file `playwright.config.ts`.

- [ ] **Step 3: Write minimal implementation**
Cài đặt Playwright:
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm install -D @playwright/test
```

Tạo config `website/client/playwright.config.ts`:
Create: `website/client/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Tạo file test E2E login:
Create: `website/client/e2e/auth-flow.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Buyer Authentication Flow E2E', () => {
  test('should navigate to login page and check invalid validations', async ({ page }) => {
    await page.goto('/login');
    
    // Fill out empty inputs
    await page.click('button:has-text("Đăng nhập")');
    
    const emailError = page.locator('text=Email không hợp lệ');
    await expect(emailError).toBeVisible();
  });
});
```

- [ ] **Step 4: Run test to verify it passes**
Run:
```bash
cd /home/nquocbao37/Code/PixelMart/website/client
pnpm test
```
Expected: PASS playwright-config.test.ts

- [ ] **Step 5: Commit**
Run:
```bash
git add playwright.config.ts e2e/auth-flow.spec.ts tests/playwright-config.test.ts
git commit -m "test(e2e): configure playwright and script dynamic auth flow validations"
```

---

## 🏁 Checklist Cuối Phase & Lỗi Fresher Cần Tránh

### Lỗi Fresher Thường Gặp
1. **Dùng node_modules lớn trong Docker Image**: Không dùng Next.js standalone build khiến image chứa toàn bộ devDependencies làm nặng tới 1.5GB. Luôn copy file standalone theo cấu trúc builder stage.
2. **Hardcode Port trong Dockerfile**: Gán cứng `PORT 3000` nhưng deploy cloud yêu cầu `80` hoặc dynamic port. Hãy đảm bảo container đọc cổng qua biến môi trường `ENV PORT=3000`.
3. **Playwright test không có mock hoặc setup test DB**: Chạy E2E test tạo data rác trực tiếp lên DB thật của production. Luôn cấu hình môi trường test biệt lập.

### Checklist Cuối Phase
- [ ] Build thành công Docker image `docker build -t client .` không lỗi compile.
- [ ] File `.github/workflows/client-ci.yml` được parse cú pháp chính xác.
- [ ] Chạy local playwright check `pnpm exec playwright test` vượt qua test case xác thực đăng nhập.
- [ ] Bộ test suite hoàn tất.
