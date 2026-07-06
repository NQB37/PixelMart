-- CreateTable
CREATE TABLE "shop_verifications" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "idFrontUrl" TEXT NOT NULL,
    "idBackUrl" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "cardHolderName" TEXT NOT NULL,
    "cardExpiry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_verifications_shopId_key" ON "shop_verifications"("shopId");

-- AddForeignKey
ALTER TABLE "shop_verifications" ADD CONSTRAINT "shop_verifications_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
