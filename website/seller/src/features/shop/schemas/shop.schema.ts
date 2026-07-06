import * as z from "zod";

export const createShopSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(3, "Shop name must be at least 3 characters")
    .max(100, "Shop name must be at most 100 characters"),
  logoUrl: z.union([z.string().url("Invalid logo URL"), z.literal("")]).optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
