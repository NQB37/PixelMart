# 🐳 PHASE 15: Docker, CI/CD & Testing

> **Prerequisite:** Phase 14 hoàn thành.

---

## 🎯 MVP Của Phase Này

- `docker compose up` → toàn bộ hệ thống (client, server, postgres, redis) chạy
- Dockerfile multi-stage build (image size tối ưu)
- GitHub Actions CI: lint → test → build trên mỗi PR
- Unit tests cho auth, cart, order services
- Integration tests cho critical flows (checkout, payment)
- `.env` quản lý đúng cho dev/staging/production

---

## 🗄️ Database Changes (MVP)

Phase này **không có bảng mới** nào được tạo. Tuy nhiên, về mặt hạ tầng dữ liệu, chúng ta thực hiện các bước sau:

1. **Docker hóa PostgreSQL:** Cấu hình container database PostgreSQL trong `docker-compose.yml` đi kèm với volume persist dữ liệu (`postgres_data`) để tránh mất mát dữ liệu khi container khởi động lại.
2. **Database Test Độc Lập:** Thiết lập một cơ sở dữ liệu test riêng biệt mang tên `pixelmart_test` (cả local và trên môi trường CI GitHub Actions). Mỗi khi chạy test pipeline, Prisma sẽ tự động chạy lệnh `npx prisma migrate deploy` để đồng bộ cấu trúc bảng sang DB test nhằm đảm bảo các test cases không làm ảnh hưởng hay làm bẩn (dirty) dữ liệu đang phát triển ở DB dev.

---

## 📋 Task Breakdown

### Task 15.1: Dockerize Backend (3-4h)

#### `infra/docker/Dockerfile.server`:
```dockerfile
# === STAGE 1: Build ===
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (cache layer)
COPY server/package*.json ./
RUN npm ci --only=production && cp -R node_modules /tmp/node_modules
RUN npm ci

# Copy source code
COPY server/ .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# === STAGE 2: Production ===
FROM node:20-alpine AS production

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /tmp/node_modules ./node_modules

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json .

# Generate Prisma Client in production
RUN npx prisma generate

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/v1/health || exit 1

# Non-root user (security)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 8000

CMD ["node", "dist/server.js"]
```

> **Multi-stage build:** Stage 1 có devDependencies (~500MB), Stage 2 chỉ có production deps (~200MB). Image giảm ~60%.

#### `infra/docker/Dockerfile.client-web`:
```dockerfile
# === STAGE 1: Build ===
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace configs and package.json files
COPY pnpm-lock.yaml* ./
COPY package.json ./
COPY web/pnpm-workspace.yaml ./web/
COPY web/shared/package.json ./web/shared/
COPY web/client-web/package.json ./web/client-web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY web/shared ./web/shared
COPY web/client-web ./web/client-web

# Build client-web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter client-web build

# === STAGE 2: Production ===
FROM node:20-alpine AS production
WORKDIR /app

# Copy built files
COPY --from=builder /app/web/client-web/.next/standalone ./
COPY --from=builder /app/web/client-web/.next/static ./web/client-web/.next/static
COPY --from=builder /app/web/client-web/public ./web/client-web/public

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000 || exit 1

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "web/client-web/server.js"]
```

> Cần thêm `output: 'standalone'` vào `next.config.ts` của `client-web` để sử dụng standalone output.

#### `infra/docker/Dockerfile.seller-web`:
```dockerfile
# === STAGE 1: Build ===
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml* ./
COPY package.json ./
COPY web/pnpm-workspace.yaml ./web/
COPY web/shared/package.json ./web/shared/
COPY web/seller-web/package.json ./web/seller-web/

RUN pnpm install --frozen-lockfile

COPY web/shared ./web/shared
COPY web/seller-web ./web/seller-web

RUN pnpm --filter seller-web build

# === STAGE 2: Production with Nginx ===
FROM nginx:1.25-alpine AS production
COPY --from=builder /app/web/seller-web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `infra/docker/Dockerfile.admin-web`:
```dockerfile
# === STAGE 1: Build ===
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml* ./
COPY package.json ./
COPY web/pnpm-workspace.yaml ./web/
COPY web/shared/package.json ./web/shared/
COPY web/admin-web/package.json ./web/admin-web/

RUN pnpm install --frozen-lockfile

COPY web/shared ./web/shared
COPY web/admin-web ./web/admin-web

RUN pnpm --filter admin-web build

# === STAGE 2: Production with Nginx ===
FROM nginx:1.25-alpine AS production
COPY --from=builder /app/web/admin-web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Task 15.2: Docker Compose (2-3h)

#### `docker-compose.yml` (Development):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pixelmart-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pixelmart_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pixelmart-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.server
    container_name: pixelmart-server
    environment:
      NODE_ENV: development
      PORT: 8000
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/pixelmart_dev
      REDIS_URL: redis://redis:6379
      CLIENT_URL: http://localhost:3000
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./server/src:/app/src  # Hot reload in dev

  client-web:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.client-web
      args:
        NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    container_name: pixelmart-client-web
    ports:
      - "3000:3000"
    depends_on:
      - server

  seller-web:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.seller-web
    container_name: pixelmart-seller-web
    ports:
      - "3001:80"
    depends_on:
      - server

  admin-web:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.admin-web
    container_name: pixelmart-admin-web
    ports:
      - "3002:80"
    depends_on:
      - server

volumes:
  postgres_data:
  redis_data:
```

#### ⚠️ Lỗi fresher hay mắc:
- **Copy `node_modules` vào image:** Thêm `.dockerignore`: `node_modules`, `.next`, `.env`, `dist`
- **Không dùng volumes cho DB:** Container stop → data mất. `postgres_data` volume giữ data persist.
- **Dùng `localhost` trong container:** Container `server` gọi `localhost:5432` → gọi chính nó, không phải container postgres. Phải dùng service name: `postgres:5432`.
- **Không dùng healthcheck + depends_on condition:** Server khởi động trước khi DB ready → crash.

### Task 15.3: GitHub Actions CI (2-3h)

#### `.github/workflows/ci.yml`:
```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: pixelmart_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        working-directory: server
        run: npm ci

      - name: Lint
        working-directory: server
        run: npm run lint

      - name: Generate Prisma Client
        working-directory: server
        run: npx prisma generate

      - name: Run migrations
        working-directory: server
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/pixelmart_test

      - name: Run tests
        working-directory: server
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/pixelmart_test
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
          NODE_ENV: test

      - name: Build
        working-directory: server
        run: npm run build

  lint-and-build-web-workspace:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          cache-dependency-path: web/pnpm-lock.yaml

      - name: Install dependencies
        working-directory: web
        run: pnpm install --frozen-lockfile

      - name: Lint and build client-web
        working-directory: web
        run: |
          pnpm --filter client-web lint
          pnpm --filter client-web build

      - name: Lint and build seller-web
        working-directory: web
        run: |
          pnpm --filter seller-web build

      - name: Lint and build admin-web
        working-directory: web
        run: |
          pnpm --filter admin-web build
```

### Task 15.4: Writing Tests (5-7h)

```bash
cd server
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

#### `server/jest.config.ts`:
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterSetup: ['<rootDir>/tests/setup.ts'],
};
```

#### Unit tests to write:
| Module | Test file | What to test |
|---|---|---|
| Auth | `auth.service.test.ts` | hash password, verify token, register validation, login logic |
| Product | `product.service.test.ts` | create product, slug generation, soft delete |
| Cart | `cart.service.test.ts` | add item, update quantity, merge cart |
| Order | `order.service.test.ts` | checkout flow, stock deduction, status transitions |
| Coupon | `coupon.service.test.ts` | validate coupon, apply discount calculation |

#### Integration test example:
```typescript
// tests/integration/checkout.test.ts
describe('Checkout Flow', () => {
  it('should create orders grouped by shop', async () => {
    // Setup: create user, 2 shops, products, add to cart
    // Act: POST /api/v1/orders
    // Assert: 2 orders created, stock deducted, cart cleared
  });

  it('should prevent over-selling', async () => {
    // Setup: product with stock = 1
    // Act: 2 concurrent checkout requests
    // Assert: only 1 succeeds, other gets 400
  });

  it('should apply coupon discount correctly', async () => {
    // Setup: coupon 10% max 100k, order 500k
    // Act: checkout with coupon
    // Assert: discount = 50k (10% of 500k, capped at 100k → 50k)
  });
});
```

---

## ⚠️ Lỗi fresher hay mắc:
- **Dockerfile không có `.dockerignore`:** Copy hàng GB `node_modules` vào build context.
- **Test dùng production database:** Phải dùng DB riêng cho test (`pixelmart_test`). Test xóa/tạo data liên tục → production data bay.
- **Chỉ viết happy path tests:** Cần test: invalid input, unauthorized access, concurrent requests, edge cases.
- **Hardcode secrets trong CI:** Dùng GitHub Secrets cho sensitive values.

---

## 🏁 Checklist Cuối Phase 15

- [ ] `docker compose up` → full system runs (client-web + seller-web + admin-web + server + DB + Redis)
- [ ] Docker images < 300MB each (multi-stage)
- [ ] `.dockerignore` blocks `node_modules`, `.env`, `.next`, `dist`
- [ ] Healthcheck endpoints work in containers
- [ ] GitHub Actions: lint + test + build passes on PR for both server and web workspaces
- [ ] Unit tests: auth, cart, order, coupon services
- [ ] Integration tests: checkout flow, stock management
- [ ] Test coverage > 60% for critical modules
- [ ] Commit: "ci: Docker containerization and CI pipeline with tests"
