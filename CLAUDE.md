# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PixelMart is a **Retro Game / 8-bit / Arcade / Cyberpunk** themed e-commerce platform with:

- `website/client` — Next.js 16 App Router (Frontend)
- `server` — Express.js v5 + Prisma ORM (Backend)
- `mobile` — TBD (empty)

Package manager: **pnpm** (required, do not use npm or yarn).

---

## Behavioral Rules

### Think Before Coding

- If a requirement is ambiguous or has multiple interpretations, surface the options and ask before implementing.
- Propose the simplest solution first. If a simpler approach exists, suggest it before writing complex code.
- If any business logic or project structure is unclear, stop and ask. Do not make silent assumptions.

### Simplicity First

- Only write what is explicitly requested. No speculative features, one-off abstractions, or unnecessary flexibility.
- Before finishing, ask: "Can this be written more concisely while remaining correct and readable?"

### Surgical Changes

- Only touch the files and lines needed for the task. Do not reformat, fix comments, or optimize neighboring code unprompted.
- Match the existing code style of the file (naming conventions, indentation, syntax) even if you disagree with it.
- If your change makes an import, variable, or function unused, remove it. Do not remove pre-existing unused code unless asked.

### Goal-Driven Execution

- Convert feature requirements into verifiable success criteria before starting (e.g., "validation schema rejects malformed input", "API route returns correct shape").
- For multi-step tasks, maintain a task list and update its status as you go.
- Always run the code, build, linter, or tests before declaring a task complete.

---

## Commands

All commands must be run from the correct working directory.

### Server (`server/`)

```bash
pnpm dev              # Start dev server with tsx --watch
pnpm test             # Run vitest (integration tests hit real DB)
pnpm lint             # ESLint
pnpm lint:fix         # Auto-fix lint errors
pnpm prisma migrate dev --name <name>   # Create migration + regenerate client
pnpm prisma generate  # Regenerate Prisma client only
```

### Client (`website/client/`)

```bash
pnpm dev              # Next.js dev server
pnpm build            # Production build
pnpm test             # Run vitest
pnpm lint             # ESLint
```

---

## Backend Architecture (`server/src/`)

**Module-based structure** — each feature lives in `src/modules/<module_name>/` with four files:

- `*.controller.ts` — receives request, calls service, returns response
- `*.routes.ts` — defines endpoints, assigns middleware and validation
- `*.service.ts` — business logic + Prisma DB operations
- `*.validation.ts` — Zod schemas for request input validation

**Shared utilities:**

- `src/utils/ApiError.ts` — always use this for HTTP errors (`ApiError.badRequest()`, `ApiError.notFound()`, etc.)
- `src/utils/ApiResponse.ts` — use `ApiResponse.success()`, `ApiResponse.created()`, `ApiResponse.noContent()`
- `src/utils/asyncHandler.ts` — wrap async controller handlers to forward errors to `next()`
- `src/middlewares/validate.middleware.ts` — applies Zod schema validation to routes
- `src/middlewares/errorHandler.middleware.ts` — catches all errors; pass errors via `next(error)`
- `src/config/env.ts` — typed environment config (JWT secrets, token expiry, CORS URLs)

**Auth flow:** JWT access tokens (in Authorization header) + refresh tokens (HttpOnly cookie). Refresh tokens are stored in DB with `jti` for rotation. Server runs on port `8000` by default.

**Testing:** Integration tests use `supertest` against a real database (not mocked). Tests in `src/modules/<module>/tests/`.

---

## Frontend Architecture (`website/client/`)

**Feature-based structure** — business logic lives in `features/<feature_name>/`:

- `components/` — UI components specific to this feature
- `hooks/` — React Query hooks for data fetching
- `schemas/` — Zod schemas for form validation
- `services/` — Axios API call functions
- `stores/` — Zustand state (UI/auth state only)
- `types/` — TypeScript types

**State management rules:**

- Server/API data → React Query (TanStack Query v5)
- Global UI state → Zustand
- Never store API response data in Zustand or component `useState`

**Axios instance** (`lib/api.ts`): Pre-configured with `withCredentials: true`, auto-attaches `Authorization: Bearer <token>` from Zustand, implements a parallel request queue for token refresh on 401 (`isRefreshing` flag + `failedQueue` pattern). The response interceptor unwraps `response.data` automatically — callers receive the data directly, not the Axios response object.

**Routing:** Next.js App Router with route groups: `(auth)` for login/register pages, `(protected)` for authenticated routes, `(public)` for public routes.

Shared components (used across features): `components/shared/`. Always use `PixelButton` from `@/components/shared/PixelButton` for action buttons.

---

## Design System (Retro/Pixel Theme)

Every UI must follow the retro aesthetic:

- **Fonts:** `font-pixel` (headings, buttons, scores), `font-retro` (body text, forms)
- **Borders:** Use `pixel-border`, `pixel-border-pink`, `pixel-border-yellow` — avoid `rounded-lg` / `rounded-full`
- **Colors:** Neon palette — `text-neon-pink`, `text-neon-cyan`, `text-neon-green`, plus `bg-neon-*` variants
- **Effects:** `glow-pink`, `glow-cyan`, `scanlines`, `retro-grid`
- **Buttons:** Always use `<PixelButton>` component, never plain HTML buttons

---

## Database Workflow

1. Edit `server/prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name <migration_name>` from `server/` — this creates the migration AND regenerates the Prisma client
3. Never modify the database directly via GUI tools
4. Never change the schema without creating a migration

---

## Environment Variables

Server requires: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `DATABASE_URL`, and optional `CLIENT_WEB_URL`, `SELLER_WEB_URL`, `ADMIN_WEB_URL`.

Client requires: `NEXT_PUBLIC_BASE_API_URL` (defaults to `http://localhost:8000/api/v1`).
