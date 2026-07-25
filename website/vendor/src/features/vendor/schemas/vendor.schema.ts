import * as z from "zod";

export const vendorInfoSchema = z.object({
  vendorName: z
    .string()
    .trim()
    .min(3, "Vendor name must be at least 3 characters")
    .max(100, "Vendor name must be at most 100 characters"),
  recipientName: z.string().trim().min(2, "Recipient name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9}|\+84\d{9})$/, "Enter a valid Vietnamese phone number"),
  street: z.string().trim().min(5, "Enter a detailed street address"),
  ward: z.string().trim().min(1, "Ward is required"),
  province: z.string().trim().min(1, "Province/City is required"),
});

export const identityBankSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .regex(/^(\d{9}|\d{12})$/, "CCCD/CMND must be 9 or 12 digits"),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, "Enter a valid bank account number"),
  cardHolderName: z.string().trim().min(2, "Cardholder name is required"),
  cardExpiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY"),
});

export const registerVendorSchema = vendorInfoSchema.extend(
  identityBankSchema.shape,
);

export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;
export const vendorInfoFieldNames = Object.keys(
  vendorInfoSchema.shape,
) as (keyof RegisterVendorInput)[];
