-- AlterEnum
-- Rename in place so existing rows keep their value (Prisma would otherwise drop and recreate the type)
ALTER TYPE "ProductStatus" RENAME VALUE 'OUT_OF_STOCK' TO 'ARCHIVED';
