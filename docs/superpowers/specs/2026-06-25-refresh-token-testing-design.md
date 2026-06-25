# Design Specification: Refresh Token Testing & Parallel Request Queue

This document specifies the design for testing the Refresh Token mechanism in PixelMart, covering both backend API testing and frontend Axios interceptor testing. It also details the parallel request queue implementation on the frontend to prevent token rotation replay attack false-positives.

## 1. Backend Testing (`server`)

We will configure Vitest and write integration tests for the authentication routes.

### Dependencies
- `vitest`: Testing framework.
- `supertest`: HTTP assertions.
- `@types/supertest`: TypeScript definitions for Supertest.

### Test Cases
File: `server/src/modules/auth/tests/auth-refresh.test.ts`
1. **Refresh Success**:
   - Register and login a test user.
   - Send `POST /api/v1/auth/refresh` with the valid `refreshToken` cookie.
   - Assert `200 OK` status, receipt of a new `accessToken`, and update of the `refreshToken` cookie.
2. **Missing Cookie**:
   - Send `POST /api/v1/auth/refresh` without the cookie.
   - Assert `401 Unauthorized` with an appropriate error message.
3. **Token Rotation / Replay Attack Prevention**:
   - Login a test user to get `refreshToken_1`.
   - Call `/auth/refresh` using `refreshToken_1` to receive `accessToken_2` and `refreshToken_2`.
   - Attempt to call `/auth/refresh` again using the now-invalidated `refreshToken_1`.
   - Assert `401 Unauthorized`.
   - Verify that `refreshToken_2` has also been deleted from the database (attempting to use `refreshToken_2` should fail with `401`).
4. **Expired/Invalid Token**:
   - Send an invalid signature or expired token string.
   - Assert `401 Unauthorized`.

---

## 2. Frontend Testing (`website/client`)

We will configure Vitest and write unit tests for the Axios interceptor to ensure it handles normal refreshing and parallel requests correctly.

### Dependencies
- `vitest`: Testing framework.

### Test Cases
File: `website/client/features/auth/tests/api-auth.test.ts`
1. **Unwrapping Response**:
   - Verify that successful API responses directly return `response.data`.
2. **Standard 401 Refresh & Retry**:
   - Make a request that returns `401`.
   - Verify `authApi.refreshToken()` is called.
   - Verify the original request is retried with the new token.
3. **Parallel 401 Queueing**:
   - Trigger multiple requests simultaneously that all fail with `401`.
   - Verify that `authApi.refreshToken()` is invoked **exactly once**.
   - Verify that all requests are queued and successfully resolved with the new access token.
4. **Refresh Failure Logout**:
   - Trigger a request that returns `401`.
   - Mock `authApi.refreshToken()` to fail.
   - Verify that the Zustand store is cleared, a toast error is shown, and the user is redirected to `/login`.

---

## 3. Frontend Interceptor Queue Implementation

We will enhance the Axios response interceptor in `website/client/lib/api.ts` to manage a queue of requests waiting for token refresh.

```typescript
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
```

When a `401` occurs:
- If `isRefreshing` is `true`, return a new `Promise` that is pushed into `failedQueue`.
- If `isRefreshing` is `false`, set it to `true`, call `authApi.refreshToken()`, update the token, and call `processQueue(null, newAccessToken)`.
- If refresh fails, call `processQueue(error, null)`.
