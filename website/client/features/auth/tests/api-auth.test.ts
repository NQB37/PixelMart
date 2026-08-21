import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
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
}

const ok = (
  data: unknown,
  config: InternalAxiosRequestConfig,
): AxiosResponse => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const unauthorized = (message: string, config: InternalAxiosRequestConfig) =>
  new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, {
    status: 401,
    statusText: "Unauthorized",
    data: { message: "Unauthorized" },
    headers: {},
    config,
  });

describe("Axios Interceptors & Queueing tests", () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    mockLocation.href = "";
    api.defaults.adapter = originalAdapter;
  });

  it("should append access token to headers", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com", roles: [] }, "initial-token");

    const interceptor = api.interceptors.request.handlers[0];
    const config = await interceptor.fulfilled({ headers: new AxiosHeaders() });
    expect(config.headers["Authorization"]).toBe("Bearer initial-token");
  });

  it("should queue parallel requests when refreshing token", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com", roles: [] }, "old-token");

    let refreshCalls = 0;
    vi.mocked(authApi.refreshToken).mockImplementation(async () => {
      refreshCalls++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { accessToken: "new-token" };
    });

    const calls = { "/route1": 0, "/route2": 0 };

    api.defaults.adapter = vi.fn(
      async (config: InternalAxiosRequestConfig) => {
        const url = config.url;

        if (url === "auth/refresh" || url?.endsWith("auth/refresh")) {
          return ok(
            { success: true, data: await authApi.refreshToken() },
            config,
          );
        }

        if (url === "/route1" || url === "/route2") {
          if (calls[url] === 0) {
            calls[url]++;
            throw unauthorized("Request failed with status code 401", config);
          }
          return ok(
            {
              success: true,
              route: url,
              tokenUsed: config.headers.Authorization,
            },
            config,
          );
        }

        return ok({}, config);
      },
    );

    const [res1, res2] = await Promise.all([
      api.get("/route1"),
      api.get("/route2"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(res1.success).toBe(true);
    expect(res1.route).toBe("/route1");
    expect(res1.tokenUsed).toBe("Bearer new-token");
    expect(res2.success).toBe(true);
    expect(res2.route).toBe("/route2");
    expect(res2.tokenUsed).toBe("Bearer new-token");
    expect(useAuthStore.getState().accessToken).toBe("new-token");
  });

  it("should fail all queued requests and logout if refresh token fails", async () => {
    useAuthStore.getState().setAuth({ id: "1", email: "test@example.com", roles: [] }, "old-token");

    vi.mocked(authApi.refreshToken).mockRejectedValue(new Error("Refresh failed"));

    api.defaults.adapter = vi.fn(
      async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
        const url = config.url;

        if (url === "auth/refresh" || url?.endsWith("auth/refresh")) {
          throw unauthorized("Refresh failed", config);
        }

        throw unauthorized("Request failed with status code 401", config);
      },
    );

    await expect(api.get("/route1")).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockLocation.href).toBe("/login");
  });
});
