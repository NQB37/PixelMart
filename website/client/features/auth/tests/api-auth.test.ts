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
    const config = await interceptor.fulfilled({ headers: {} } as any);
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

    let calls = { "/route1": 0, "/route2": 0 };

    api.defaults.adapter = vi.fn().mockImplementation(async (config: any) => {
      const url = config.url;

      if (url === "auth/refresh" || url?.endsWith("auth/refresh")) {
        return {
          data: { success: true, data: await authApi.refreshToken() },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      if (url === "/route1" || url === "/route2") {
        if (calls[url] === 0) {
          calls[url]++;
          const error: any = new Error("Request failed with status code 401");
          error.response = {
            status: 401,
            data: { message: "Unauthorized" },
            headers: {},
            config,
          };
          error.config = config;
          throw error;
        }
        return {
          data: { success: true, route: url, tokenUsed: config.headers.Authorization },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      }

      return {
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    }) as any;

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

    api.defaults.adapter = vi.fn().mockImplementation(async (config: any) => {
      const url = config.url;

      if (url === "auth/refresh" || url?.endsWith("auth/refresh")) {
        const error: any = new Error("Refresh failed");
        error.response = {
          status: 401,
          data: { message: "Unauthorized" },
          headers: {},
          config,
        };
        error.config = config;
        throw error;
      }

      const error: any = new Error("Request failed with status code 401");
      error.response = {
        status: 401,
        data: { message: "Unauthorized" },
        headers: {},
        config,
      };
      error.config = config;
      throw error;
    }) as any;

    await expect(api.get("/route1")).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockLocation.href).toBe("/login");
  });
});
