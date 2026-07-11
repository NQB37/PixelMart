-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_categories_productId_idx" ON "product_categories"("productId");

-- CreateIndex
CREATE INDEX "product_categories_categoryId_idx" ON "product_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
