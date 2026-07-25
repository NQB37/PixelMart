# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PixelMart is a modern, minimalist **Mint Fresh** themed e-commerce platform (young/dynamic, mint-green primary — migrated from the original retro/pixel theme; see `DESIGN.md`) with:

- `website/client` — Next.js 16 App Router (Customer-facing frontend)
- `website/admin` — Vite + React + TanStack Router (Admin portal)
- `website/seller` — Vite + React + TanStack Router (Seller portal)
- `website/shared` (`@website/shared`) — code shared across the three `website/*` apps (auth store/API client/schemas, generic UI components)
- `server` — Express.js v5 + Prisma ORM (Backend)
- `mobile` — TBD (empty)

`website/*` is a single pnpm workspace (see `website/pnpm-workspace.yaml`) — run `pnpm install` from `website/`, then `pnpm --filter <app>` or `cd website/<app>` for per-app commands.

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

### Safe Verification

- Never strip, comment out, or short-circuit an auth guard, role check, or route protection (e.g. `beforeLoad` in `router.tsx`) just to reach a page for manual/browser testing — even temporarily, even if you intend to revert it. If a feature is behind login, ask the user for test credentials (or how to seed one) and log in through the real flow instead.
- If you're unsure whether verifying something requires touching security-sensitive code, ask first rather than trying it and reverting after.

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

### Client / Admin / Seller (`website/{client,admin,seller}/`)

Run `pnpm install` once from `website/` (single workspace lockfile). Then, from each app's directory (or `pnpm --filter <client|admin|seller> <script>` from `website/`):

```bash
pnpm dev              # Dev server (Next.js for client, Vite for admin/seller)
pnpm build            # Production build
pnpm test             # Run vitest (client only)
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

**Axios instance** (`lib/api.ts`): built via `createAuthApiClient()` from `@website/shared/auth` — `withCredentials: true`, auto-attaches `Authorization: Bearer <token>`, implements a parallel request queue for token refresh on 401 (`isRefreshing` flag + `failedQueue` pattern). The response interceptor unwraps `response.data` automatically — callers receive the data directly, not the Axios response object.

**Routing:** Next.js App Router with route groups: `(auth)` for login/register pages, `(protected)` for authenticated routes, `(public)` for public routes.

Shared components (used across features): `components/shared/`. Always use `PixelButton` from `@website/shared/ui` for action buttons.

### `website/shared` (`@website/shared`)

Code used by more than one of `client`/`admin`/`seller` lives here, not duplicated per app:

- `@website/shared/auth` — `createAuthStore()` (Zustand factory, parameterized by localStorage key), `createAuthApiClient()` (axios instance + refresh-on-401 interceptor factory), `createAuthApi()` (login/register/logout/refreshToken/getMe), `loginSchema`/`registerSchema` (Zod), shared `UserRole`/`UserInfo` types, and `hasRole()` for role checks.
- `@website/shared/ui` — generic mint-theme UI (`PixelButton`, `SectionHeader`, `cn`, and the shadcn `Form`/`Field`/`Label`/`DropdownMenu` wrappers). Note: `PixelButton` keeps its name for API stability but now renders a mint-system button.
- `@website/shared/styles/theme.css` — the **Mint Fresh** Tailwind v4 theme tokens (OKLCH); all three apps (`client`/`admin`/`seller`) import it. Legacy `neon-*`/`pixel-*` utilities remain temporarily during the client component sweep.

Each app still owns anything framework-specific (Next.js route guards vs TanStack Router `beforeLoad`, per-app toast copy, per-app env var names) as a thin wrapper around the shared factories — only add to `website/shared` when a piece of logic is truly framework-agnostic and used by more than one app.

### Modal / Dialog Pattern

Every Add/Edit/Delete modal is a single **self-contained component** — no `forwardRef`/`useImperativeHandle`, no ref held by the parent page:

- The component renders its own trigger `<Button>` wrapped in `<DialogTrigger asChild>` — importing `<XModal />` anywhere is enough to get a working button + modal.
- It owns its own `isOpened` state via `useState`, wired to `<Dialog open={isOpened} onOpenChange={setIsOpened}>` (or a custom `handleOpenChange` — see below).
- Build modals from `@website/shared/ui`'s `Dialog`/`DialogTrigger`/`DialogContent`/`DialogHeader`/`DialogFooter`/`DialogTitle`/`DialogDescription` (Radix `@radix-ui/react-dialog`, same shadcn-wrapper convention as `DropdownMenu`). Do not hand-roll a native `<dialog>` element.
- For Edit modals seeded from a prop (e.g. `category: CategoryNode`), do **not** reset local form state from the prop inside a `useEffect` keyed on `isOpened` — that's a "sync prop into state" anti-pattern and trips the `react-hooks/set-state-in-effect` ESLint rule. Instead, reset the state inside the `onOpenChange` handler itself (only when opening), e.g.:
  ```tsx
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setName(category.name);
      // ...reset the rest of the form from the prop
    }
    setIsOpened(next);
  };
  ```
- Reference implementation: `website/admin/src/features/categories/components/{CreateCategoryModal,UpdateCategoryModal,DeleteCategoryModal}.tsx`.

---

## Design System (Mint Fresh Theme)

Full spec + token tables: **`DESIGN.md`** (repo root). Tokens live in `@website/shared/styles/theme.css` (OKLCH). Every UI must follow the mint aesthetic:

- **Fonts:** `font-display` (Plus Jakarta Sans — headings, prices, buttons), `font-sans` (Inter — body, forms). Prices use `tabular-nums`.
- **Colors:** semantic tokens only — `bg-primary`/`text-primary` (mint), `bg-secondary`/`bg-accent`/`bg-muted`, `bg-highlight` (coral, sale/promo), `bg-success`/`bg-warning`. Never hardcode `slate-*`/`indigo-*`/hex.
- **Borders/Radius:** soft — `rounded-md`/`rounded-lg`/`rounded-xl` (from `--radius: 0.75rem`), `border-border`. No `pixel-border`.
- **Buttons:** use `<PixelButton>` from `@website/shared/ui` (mint variants), or `bg-primary`/`bg-highlight` with `rounded-md`.
- **Do NOT use** legacy `neon-*`, `glow-*`, `scanlines`, `retro-grid`, `pixel-border`, `font-pixel`/`font-retro` in new UI — they're deprecated and being removed as the client is swept.

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
