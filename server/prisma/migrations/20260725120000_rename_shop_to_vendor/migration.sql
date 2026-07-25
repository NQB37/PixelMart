-- Rename the Shop/Seller domain to Vendor. Pure renames, no data loss.

-- Enums
ALTER TYPE "ROLE" RENAME VALUE 'SELLER' TO 'VENDOR';
ALTER TYPE "AddressOwnerType" RENAME VALUE 'SHOP' TO 'VENDOR';
ALTER TYPE "ShopStatus" RENAME TO "VendorStatus";

-- Tables
ALTER TABLE "shops" RENAME TO "vendors";
ALTER TABLE "shop_verifications" RENAME TO "vendor_verifications";

-- Columns
ALTER TABLE "vendors" RENAME COLUMN "shopName" TO "vendorName";
ALTER TABLE "vendor_verifications" RENAME COLUMN "shopId" TO "vendorId";
ALTER TABLE "products" RENAME COLUMN "shopId" TO "vendorId";

-- Indexes (renaming a pkey/unique index renames its constraint too)
ALTER INDEX "shops_pkey" RENAME TO "vendors_pkey";
ALTER INDEX "shops_ownerId_key" RENAME TO "vendors_ownerId_key";
ALTER INDEX "shops_ownerId_idx" RENAME TO "vendors_ownerId_idx";
ALTER INDEX "shop_verifications_pkey" RENAME TO "vendor_verifications_pkey";
ALTER INDEX "shop_verifications_shopId_key" RENAME TO "vendor_verifications_vendorId_key";
ALTER INDEX "products_shopId_idx" RENAME TO "products_vendorId_idx";

-- Foreign keys
ALTER TABLE "vendors" RENAME CONSTRAINT "shops_ownerId_fkey" TO "vendors_ownerId_fkey";
ALTER TABLE "vendor_verifications" RENAME CONSTRAINT "shop_verifications_shopId_fkey" TO "vendor_verifications_vendorId_fkey";
ALTER TABLE "products" RENAME CONSTRAINT "products_shopId_fkey" TO "products_vendorId_fkey";
