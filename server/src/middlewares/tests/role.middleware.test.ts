import { describe, it, expect, vi } from "vitest";
import { requireRole } from "../role.middleware";
import { Request, Response } from "express";

const mockReq = (roles: string[]) => ({ user: { roles } }) as unknown as Request;

describe("requireRole middleware", () => {
  it("calls next() with no error when user has an allowed role", () => {
    const next = vi.fn();
    requireRole("ADMIN", "VENDOR")(mockReq(["VENDOR"]), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() with a forbidden error when user lacks an allowed role", () => {
    const next = vi.fn();
    requireRole("ADMIN")(mockReq(["CUSTOMER"]), {} as Response, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });

  it("calls next() with a forbidden error when req.user has no roles", () => {
    const next = vi.fn();
    requireRole("ADMIN")({} as Request, {} as Response, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
  });
});
