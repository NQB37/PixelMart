-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_productVariantId_fkey";

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
