import { JwtPayload } from "@/utils/jwt";
import { Vendor } from "@/generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      validatedQuery?: Record<string, unknown>;
      vendor?: Vendor;
    }
  }
}
