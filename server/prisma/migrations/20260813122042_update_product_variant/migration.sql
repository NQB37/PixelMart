/*
  Warnings:

  - You are about to drop the column `productId` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_productId_fkey";

-- DropIndex
DROP INDEX "product_images_productId_idx";

-- DropIndex
DROP INDEX "products_slug_key";

-- DropIndex
DROP INDEX "products_vendorId_sku_key";

-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "productId",
ADD COLUMN     "productVariantId" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "description",
DROP COLUMN "metaDescription",
DROP COLUMN "metaTitle",
DROP COLUMN "sku",
DROP COLUMN "slug",
DROP COLUMN "thumbnail",
ADD COLUMN     "optionNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "thumbnail" TEXT,
    "options" JSONB NOT NULL DEFAULT '{}',
    "optionsKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_slug_key" ON "product_variants"("slug");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON "product_variants"("productId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_optionsKey_key" ON "product_variants"("productId", "optionsKey");

-- CreateIndex
CREATE INDEX "product_images_productVariantId_idx" ON "product_images"("productVariantId");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
