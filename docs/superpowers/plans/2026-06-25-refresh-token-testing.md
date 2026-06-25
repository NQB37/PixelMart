# Refresh Token Testing & Parallel Request Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup Vitest in both backend and frontend, implement parallel request queueing in the frontend Axios interceptor to fix token rotation replay attack false-positives, and write complete test suites to verify both components.

**Architecture:** We will set up Vitest on both backend and frontend. The frontend Axios interceptor will be enhanced with a lock (`isRefreshing`) and a `failedQueue` queue to intercept and buffer parallel requests during refresh. Backend integration tests will use Supertest with the Prisma Client against the database, verifying token generation, refresh, and rotation.

**Tech Stack:** Vitest, Supertest, Axios, Zustand, Prisma, Express.js.

## Global Constraints
- Every task must end with independently testable deliverables.
- Implement minimal, surgical changes that don't disrupt adjacent logic.
- Avoid placeholder comments or unfinished logic. All code must be complete.

---

### Task 1: Setup Vitest & Supertest in `server`

**Files:**
- Modify: `server/package.json`
- Create: `server/vitest.config.ts`

**Interfaces:**
- Consumes: `server/src/app.ts` (the Express app instance)
- Produces: Test execution scripts for the backend

- [ ] **Step 1: Install devDependencies in server**

Run the following command from the `server` directory:
```bash
pnpm add -D vitest supertest @types/supertest
```
Expected: The packages are successfully installed.

- [ ] **Step 2: Create Vitest config file**

Create the file `server/vitest.config.ts` with the following content:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Update `package.json` with test scripts**

Modify `server/package.json` to add `"test": "vitest run"` and `"test:watch": "vitest"` scripts:
```json
  "scripts": {
    "dev": "tsx --watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 4: Verify Vitest runs (will find no tests yet)**

Run the test command inside the `server` directory:
```bash
pnpm test
```
Expected: Vitest runs, scans for files, and completes with a "No test files found" message or similar.

- [ ] **Step 5: Commit changes**

```bash
git add server/package.json server/vitest.config.ts
git commit -m "test(server): setup vitest and supertest"
```

---

### Task 2: Write Backend Integration Tests

**Files:**
- Create: `server/src/modules/auth/tests/auth-refresh.test.ts`

**Interfaces:**
- Consumes: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh` HTTP endpoints
- Produces: Test results verifying refresh token and token rotation functionality

- [ ] **Step 1: Write integration test file**

Create the file `server/src/modules/auth/tests/auth-refresh.test.ts` with the following content:
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";

describe("Auth Refresh Token Integration Tests", () => {
  const testEmail = `test-refresh-${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let accessToken: string;
  let refreshTokenCookie: string;

  // Cleanup any test user data before and after tests to avoid polluting the database
  const cleanup = async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const hasRefreshCookie = cookies.some((c: string) => c.includes("refreshToken="));
    expect(hasRefreshCookie).toBe(true);
  });

  it("should login user successfully and return tokens", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    const cookies = res.headers["set-cookie"];
    refreshTokenCookie = cookies.find((c: string) => c.includes("refreshToken="));
    expect(refreshTokenCookie).toBeDefined();
  });

  it("should refresh access token using valid refresh token cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [refreshTokenCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.accessToken).not.toBe(accessToken);

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const newRefreshCookie = cookies.find((c: string) => c.includes("refreshToken="));
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie).not.toBe(refreshTokenCookie);
  });

  it("should reject refresh when refreshToken cookie is missing", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("should implement token rotation and revoke all tokens if refresh token is reused", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testEmail, password: testPassword });

    const cookies1 = loginRes.headers["set-cookie"];
    const cookie1 = cookies1.find((c: string) => c.includes("refreshToken="));

    // First refresh (valid) -> returns new cookie2
    const refreshRes1 = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [cookie1]);

    expect(refreshRes1.status).toBe(200);
    const cookies2 = refreshRes1.headers["set-cookie"];
    const cookie2 = cookies2.find((c: string) => c.includes("refreshToken="));

    // Second refresh using cookie1 (replay attack)
    const replayRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [cookie1]);

    expect(replayRes.status).toBe(401);

    // Verify cookie2 is now also revoked
    const revokedRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [cookie2]);

    expect(revokedRes.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run backend integration tests**

Run the test command inside the `server` directory:
```bash
pnpm test
```
Expected: All 5 integration tests pass successfully.

- [ ] **Step 3: Commit tests**

```bash
git add server/src/modules/auth/tests/auth-refresh.test.ts
git commit -m "test(server): add integration tests for refresh token"
```

---

### Task 3: Setup Vitest in `website/client`

**Files:**
- Modify: `website/client/package.json`
- Create: `website/client/vitest.config.ts`

**Interfaces:**
- Consumes: None
- Produces: Test execution scripts for the frontend client

- [ ] **Step 1: Install devDependencies in website/client**

Run the following command from the `website/client` directory:
```bash
pnpm add -D vitest jsdom
```
Expected: The packages are successfully installed.

- [ ] **Step 2: Create Vitest config file**

Create the file `website/client/vitest.config.ts` with the following content:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 3: Update `package.json` with test scripts**

Modify `website/client/package.json` to add `"test": "vitest run"` and `"test:watch": "vitest"` scripts:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 4: Verify Vitest runs (will find no tests yet)**

Run the test command inside the `website/client` directory:
```bash
pnpm test
```
Expected: Vitest runs, scans for files, and completes with a "No test files found" message or similar.

- [ ] **Step 5: Commit changes**

```bash
git add website/client/package.json website/client/vitest.config.ts
git commit -m "test(client): setup vitest with jsdom"
```

---

### Task 4: Implement Parallel Queue & Fix Axios Interceptor

**Files:**
- Modify: `website/client/lib/api.ts`

**Interfaces:**
- Consumes: Zustand store `useAuthStore` and service `authApi.refreshToken()`
- Produces: A thread-safe Axios client instance `api` that handles token refresh and retries

- [ ] **Step 1: Replace Axios response interceptor in `api.ts`**

Update `website/client/lib/api.ts` to implement the `failedQueue` and `isRefreshing` flags.
Specifically, replace the response interceptor block (lines 30-76) with:
```typescript
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Refresh token if catch 401 error and not retry
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/refresh") &&
      !originalRequest.url?.includes("auth/login")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await authApi.refreshToken();
        const newAccessToken = data.accessToken;

        // Save new access token
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        toast.error("Refresh token failed. Please login again!");
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.message || error?.message);
    }

    return Promise.reject(error);
  },
);
```

- [ ] **Step 2: Verify compilation and run frontend dev build**

Make sure no compilation errors arise. Build website client:
```bash
pnpm build
```
Expected: The Next.js project builds successfully without typescript errors.

- [ ] **Step 3: Commit changes**

```bash
git add website/client/lib/api.ts
git commit -m "feat(client): implement parallel request queue in axios interceptor"
```

---

### Task 5: Write Frontend Unit/Integration Tests

**Files:**
- Create: `website/client/features/auth/tests/api-auth.test.ts`

**Interfaces:**
- Consumes: Frontend Axios client `api` and Zustand store `useAuthStore`
- Produces: Test results verifying Axios interceptor behavior under normal and parallel 401 errors

- [ ] **Step 1: Create frontend unit test file**

Create the file `website/client/features/auth/tests/api-auth.test.ts` with the following content:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

// Mock authApi and toast
vi.mock("../services/auth.service", () => ({
  authApi: {
    refreshToken: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock window location
const mockLocation = { href: "" };
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
  });
} else {
  (global as any).window = { location: mockLocation } as any;
}

describe("Axios Interceptors & Queueing tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    mockLocation.href = "";
  });

  it("should append access token to headers", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com" }, "initial-token");

    const interceptor = api.interceptors.request.handlers[0];
    const config = await interceptor.fulfilled({ headers: {} } as any);
    expect(config.headers["Authorization"]).toBe("Bearer initial-token");
  });

  it("should queue parallel requests when refreshing token", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com" }, "old-token");

    let refreshCalls = 0;
    vi.mocked(authApi.refreshToken).mockImplementation(async () => {
      refreshCalls++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { accessToken: "new-token" };
    });

    let calls = { "/route1": 0, "/route2": 0 };
    const originalRequest = api.request;

    api.request = vi.fn().mockImplementation(async (config: any) => {
      const url = config.url;
      if (url === "auth/refresh") {
        return { data: await authApi.refreshToken() };
      }

      if (url === "/route1" || url === "/route2") {
        if (calls[url] === 0) {
          calls[url]++;
          const err = new Error("Unauthorized") as any;
          err.config = config;
          err.response = { status: 401 };
          return api.interceptors.response.handlers[0].rejected(err);
        }
        return { data: { success: true, route: url, tokenUsed: config.headers.Authorization } };
      }
      return { data: {} };
    }) as any;

    const [res1, res2] = await Promise.all([
      api.get("/route1"),
      api.get("/route2"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(res1.data.success).toBe(true);
    expect(res1.data.tokenUsed).toBe("Bearer new-token");
    expect(res2.data.success).toBe(true);
    expect(res2.data.tokenUsed).toBe("Bearer new-token");
    expect(useAuthStore.getState().accessToken).toBe("new-token");

    api.request = originalRequest;
  });

  it("should fail all queued requests and logout if refresh token fails", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com" }, "old-token");

    vi.mocked(authApi.refreshToken).mockRejectedValue(new Error("Refresh failed"));

    const originalRequest = api.request;
    api.request = vi.fn().mockImplementation(async (config: any) => {
      const url = config.url;
      if (url === "auth/refresh") {
        throw new Error("Refresh failed");
      }
      const err = new Error("Unauthorized") as any;
      err.config = config;
      err.response = { status: 401 };
      return api.interceptors.response.handlers[0].rejected(err);
    }) as any;

    await expect(api.get("/route1")).rejects.toThrow("Refresh failed");
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockLocation.href).toBe("/login");

    api.request = originalRequest;
  });
});
```

- [ ] **Step 2: Run frontend tests**

Run the test command inside the `website/client` directory:
```bash
pnpm test
```
Expected: All 3 frontend tests pass successfully.

- [ ] **Step 3: Commit frontend tests**

```bash
git add website/client/features/auth/tests/api-auth.test.ts
git commit -m "test(client): add unit tests for axios interceptor and queue"
```
