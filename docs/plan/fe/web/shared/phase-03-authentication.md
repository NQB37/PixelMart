# Phase 3: Authentication Implementation Plan - Shared Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai cơ chế Axios Interceptors cho `@pixelmart/shared-web` để bắt mã lỗi 401 (Unauthorized), thực hiện tự động gọi API làm mới Token (JWT Token Refresh/Rotation) và hàng đợi (queue) các request song song để gửi lại sau khi refresh thành công.

**Architecture:** Khi một request trả về mã lỗi 401, Axios interceptor sẽ chặn lỗi này. Nếu chưa có tiến trình làm mới token nào đang chạy, nó sẽ đánh dấu flag `isRefreshing = true` và gọi `POST /auth/refresh`. Trong thời gian đó, tất cả các request song song khác bị lỗi 401 sẽ được đưa vào hàng đợi (`failedQueue`). Khi token refresh thành công, toàn bộ hàng đợi sẽ được resolve và thực thi lại; nếu thất bại, hàng đợi bị reject và hệ thống phát ra CustomEvent `auth:unauthorized` để redirect người dùng về trang login.

**Tech Stack:** React 18+, Axios 1.x, Jest, TypeScript.

## Global Constraints

- Môi trường chạy dự án: Node.js 18+
- Phiên bản chính của thư viện: React 18.3+, TypeScript 5.0+, Axios 1.7+
- Thư mục làm việc: `web/shared`
- Toàn bộ thay đổi phải được viết dưới dạng TypeScript nghiêm ngặt (strict mode).
- Phải áp dụng TDD: Viết test lỗi giả định trước, sau đó phát triển interceptor để làm test pass.
- Không sử dụng bất kỳ placeholder hay "TODO" nào trong mã nguồn.

---

### Task 3.1: Viết Axios Interceptors cho cơ chế Token Refresh & Hàng đợi Request (6h)

**Files:**
- Modify: `web/shared/src/utils/api.ts`
- Test: `web/shared/tests/api-auth.test.ts`

**Interfaces:**
- Consumes: Axios Instance `api` đã tạo ở Phase 1.
- Produces: `api` client được nâng cấp tự động xử lý JWT Refresh Token và retry request.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/api-auth.test.ts`. File test này sử dụng mock adapter để kiểm thử 3 kịch bản: refresh token thành công và retry, hàng đợi request song song, và huỷ hàng đợi khi refresh thất bại.
```typescript
import { api } from '../src/utils/api';

describe('Axios Interceptors - Token Refresh', () => {
  let adapterMock: jest.Mock;

  beforeEach(() => {
    adapterMock = jest.fn();
    api.defaults.adapter = adapterMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should refresh token on 401 and retry the original request', async () => {
    // 1st request to /products fails with 401
    // 2nd request is POST /auth/refresh, succeeds with 200
    // 3rd request is retry of /products, succeeds with 200
    adapterMock
      .mockRejectedValueOnce({
        config: { url: '/products', method: 'get' },
        response: { status: 401, data: { message: 'Unauthorized' } },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { message: 'Token refreshed' },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'Product 1' }],
      });

    const response = await api.get('/products');
    expect(response.status).toBe(200);
    expect(response.data).toEqual([{ id: 1, name: 'Product 1' }]);
    expect(adapterMock).toHaveBeenCalledTimes(3);
    expect(adapterMock.mock.calls[1][0].url).toContain('/auth/refresh');
  });

  it('should queue multiple parallel requests and resolve them when token refresh succeeds', async () => {
    // 1st request to /req1 fails with 401
    // 2nd request to /req2 is made in parallel, gets queued
    // 3rd request is POST /auth/refresh, succeeds with 200
    // 4th and 5th requests are retries of /req1 and /req2, succeed with 200
    adapterMock
      .mockRejectedValueOnce({
        config: { url: '/req1', method: 'get' },
        response: { status: 401, data: { message: 'Unauthorized' } },
      })
      .mockRejectedValueOnce({
        config: { url: '/req2', method: 'get' },
        response: { status: 401, data: { message: 'Unauthorized' } },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { message: 'Token refreshed' },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { data: 'req1 success' },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { data: 'req2 success' },
      });

    const [res1, res2] = await Promise.all([
      api.get('/req1'),
      api.get('/req2'),
    ]);

    expect(res1.data).toEqual({ data: 'req1 success' });
    expect(res2.data).toEqual({ data: 'req2 success' });
    expect(adapterMock).toHaveBeenCalledTimes(5);
  });

  it('should reject all queued requests if token refresh fails', async () => {
    const dispatchMock = jest.fn();
    if (typeof window !== 'undefined') {
      jest.spyOn(window, 'dispatchEvent').mockImplementation(dispatchMock);
    } else {
      (global as any).window = { dispatchEvent: dispatchMock };
    }

    adapterMock
      .mockRejectedValueOnce({
        config: { url: '/products', method: 'get' },
        response: { status: 401, data: { message: 'Unauthorized' } },
      })
      .mockRejectedValueOnce({
        config: { url: '/auth/refresh', method: 'post' },
        response: { status: 401, data: { message: 'Session expired' } },
      });

    await expect(api.get('/products')).rejects.toBeDefined();
    expect(dispatchMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/api-auth.test.ts`
Expected: FAIL. Các request trả về lỗi 401 trực tiếp chứ không tự động gọi `/auth/refresh` và retry.
```
Expected status: 200
Received: throws AxiosError with 401 Unauthorized
```

- [ ] **Step 3: Write minimal implementation**

Cập nhật file `web/shared/src/utils/api.ts` để thêm Axios Interceptors.
```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});

interface QueueItem {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô hạn nếu chính api gọi /auth/refresh bị lỗi 401
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Nếu gặp mã lỗi 401 và request chưa được thử lại (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Phát ra CustomEvent để báo cho tầng UI biết session đã hết hạn hoàn toàn
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/api-auth.test.ts`
Expected: PASS
```
PASS  web/shared/tests/api-auth.test.ts
  Axios Interceptors - Token Refresh
    ✓ should refresh token on 401 and retry the original request (X ms)
    ✓ should queue multiple parallel requests and resolve them when token refresh succeeds (X ms)
    ✓ should reject all queued requests if token refresh fails (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/utils/api.ts web/shared/tests/api-auth.test.ts
git commit -m "feat: implement axios interceptor for silent jwt token refresh with request queuing"
```

---

## 🏁 Checklist Hoàn Thành Phase 3

- [ ] File test `api-auth.test.ts` được đặt đúng tại `web/shared/tests/`.
- [ ] Lệnh `npx jest web/shared/tests/api-auth.test.ts` hoàn thành thành công 100%.
- [ ] Interceptor đảm bảo không xảy ra vòng lặp vô hạn (infinite recursion loop) khi gọi endpoint `/auth/refresh` bị lỗi 401.
- [ ] Cơ chế hàng đợi `failedQueue` giữ đúng context và re-trigger tất cả các request song song khi refresh token thành công.
- [ ] Dispatch CustomEvent `auth:unauthorized` khi refresh token thất bại hoàn toàn.

## ⚠️ Lỗi Fresher Hay Mắc Phải

1. **Vòng lặp vô hạn (Infinite Loop)**: Không loại trừ `/auth/refresh` khỏi logic interceptor 401. Khi token hết hạn lâu ngày, api gọi `/auth/refresh` trả về 401 → kích hoạt interceptor → gọi lại `/auth/refresh` → tiếp tục 401, dẫn tới tràn stack hoặc treo ứng dụng.
2. **Quên gán flag `_retry`**: Không đánh dấu request gốc là `_retry = true`. Khi request retried cũng bị lỗi (chẳng hạn do lỗi server thật hoặc token hết hạn thật), interceptor lại tiếp tục cố gắng refresh token liên tục.
3. **Mất context headers/params**: Gọi lại request bị lỗi bằng cách tạo request mới thủ công thay vì tái sử dụng object `config` (dùng `api(originalRequest)`).
4. **Không làm sạch hàng đợi (Queue leak)**: Không reset biến `failedQueue = []` khi kết thúc làm mới token, khiến bộ nhớ bị rò rỉ hoặc các request cũ bị gọi lại không mong muốn.
5. **Nuốt lỗi nguyên bản**: Khi token refresh thất bại, quên trả về `Promise.reject(refreshError)`, làm cho UI không nhận biết được lỗi để hiển thị giao diện báo lỗi/redirect.
