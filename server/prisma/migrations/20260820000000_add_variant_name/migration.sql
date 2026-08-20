-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "name" TEXT;

-- backfill existing rows from their slug before making the column required
UPDATE "product_variants" SET "name" = "slug" WHERE "name" IS NULL;

ALTER TABLE "product_variants" ALTER COLUMN "name" SET NOT NULL;
