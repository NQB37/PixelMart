import { prisma } from "@/libs/prisma";
import { ApiError } from "@/utils/ApiError";
import { ROLE } from "@/generated/prisma/client";
import { CreateShopInput } from "./shop.validation";

class ShopService {
  public async createShop(userId: string, data: CreateShopInput) {
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: userId },
    });
    if (existingShop) {
      throw ApiError.conflict("You already have a shop");
    }

    return prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { ...data, ownerId: userId },
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
