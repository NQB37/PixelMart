import z from 'zod';

export const createShopSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(3, 'Shop name must be at least 3 characters')
    .max(100),
  logoUrl: z.url('Invalid logo URL').optional(),
  // pickup address
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9}|\+84\d{9})$/, 'Enter a valid Vietnamese phone number'),
  street: z.string().trim().min(5, 'Enter a detailed street address'),
  ward: z.string().trim().min(1, 'Ward is required'),
  province: z.string().trim().min(1, 'Province/City is required'),
  // identity + bank verification
  nationalId: z
    .string()
    .trim()
    .regex(/^(\d{9}|\d{12})$/, 'CCCD/CMND must be 9 or 12 digits'),
  idFrontUrl: z.url('Invalid ID front photo URL'),
  idBackUrl: z.url('Invalid ID back photo URL'),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, 'Enter a valid bank account number'),
  cardHolderName: z.string().trim().min(2, 'Cardholder name is required'),
  cardExpiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format must be MM/YY'),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
