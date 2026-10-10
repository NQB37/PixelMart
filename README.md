# PixelMart

Nền tảng e-commerce full-stack — dự án học tập. Xem lộ trình học v1 → v8 trong [`docs/README.md`](docs/README.md).

## Yêu cầu

- Node.js 24 LTS
- pnpm (version được pin trong `package.json` → `packageManager`)

## Lệnh thường dùng

```bash
pnpm install
pnpm turbo lint typecheck build   # chạy như CI
pnpm format                       # Prettier
```

## Cấu trúc repo

> Sơ bộ — hoàn thiện ở PXM-43.

```
apps/                 # api (NestJS), web (Next.js), admin (Vite) — thêm từ PXM-9/10
packages/
  config/             # @pixelmart/config: tsconfig, ESLint flat config, Prettier dùng chung
  contracts/          # @pixelmart/contracts: Zod schema request/response (internal, TS source)
  api-client/         # @pixelmart/api-client: typed client gọi /v1 (internal, TS source)
pnpm-workspace.yaml
turbo.json            # task graph: build, dev, lint, typecheck, test
```

- **Internal package**: `contracts` và `api-client` export thẳng `src/index.ts`, không build ra `dist`; app tiêu thụ tự compile.
- Mọi app/package `extends` tsconfig từ `@pixelmart/config/tsconfig/*`.
