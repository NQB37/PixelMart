-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "rejectedReason" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "thumbnail" TEXT;

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "products_vendorId_sku_key" ON "products"("vendorId", "sku");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
