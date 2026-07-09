import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';
import { ROLE } from '@/generated/prisma/client';
import { CreateShopInput } from './shop.validation';

class ShopService {
  public async getMyShop(userId: string) {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: userId },
      include: { verification: true },
    });
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    return shop;
  }

  public async createShop(userId: string, data: CreateShopInput) {
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (existingShop) {
      throw ApiError.conflict('You already have a shop');
    }

    const { shopName, logoUrl, ...verification } = data;

    return prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { shopName, logoUrl, ownerId: userId },
      });

      await tx.shopVerification.create({
        data: { ...verification, shopId: shop.id },
      });

      const sellerRole = await tx.role.upsert({
        where: { name: ROLE.SELLER },
        update: {},
        create: { name: ROLE.SELLER },
      });

      await tx.userRoles.upsert({
        where: { userId_roleId: { userId, roleId: sellerRole.id } },
        update: {},
        create: { userId, roleId: sellerRole.id },
      });

      return shop;
    });
  }
}

export const shopService = new ShopService();
