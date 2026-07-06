import z from "zod";

export const createShopSchema = z.object({
  shopName: z.string().trim().min(3, "Shop name must be at least 3 characters").max(100),
  logoUrl: z.url("Invalid logo URL").optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
