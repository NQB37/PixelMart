import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';
import { ApprovalStatus, ROLE, ShopStatus } from '@/generated/prisma/client';
import { CreateShopInput, ListShopsQuery } from './shop.validation';

const shopWithOwner = {
  user: { select: { email: true, profile: { select: { fullName: true } } } },
} as const;

type ShopWithOwner = {
  id: string;
  shopName: string;
  logoUrl: string | null;
  rating: number;
  approvalStatus: ApprovalStatus;
  status: ShopStatus;
  rejectedReason: string | null;
  createdAt: Date;
  user: { email: string; profile: { fullName: string } | null };
};

class ShopService {
  // === SELLER ROUTES ===
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

      return shop;
    });
  }

  // ===== ADMIN ONLY =====
  public async getAllShops({
    page,
    limit,
    search,
    approvalStatus,
  }: ListShopsQuery) {
    const where = {
      approvalStatus,
      ...(search && {
        OR: [
          { shopName: { contains: search, mode: 'insensitive' as const } },
          {
            user: { email: { contains: search, mode: 'insensitive' as const } },
          },
        ],
      }),
    };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: shopWithOwner,
      }),
      prisma.shop.count({ where }),
    ]);

    return {
      shops: shops.map((shop) => this.toAdminShop(shop)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public async getShopById(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { ...shopWithOwner, verification: true },
    });
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    return { ...this.toAdminShop(shop), verification: shop.verification };
  }

  public async approveShop(shopId: string) {
    const pendingShop = await this.findPendingShop(shopId);

    const shop = await prisma.$transaction(async (tx) => {
      const updated = await tx.shop.update({
        where: { id: shopId },
        data: { approvalStatus: ApprovalStatus.APPROVED, rejectedReason: null },
        include: shopWithOwner,
      });

      const sellerRole = await tx.role.upsert({
        where: { name: ROLE.SELLER },
        update: {},
        create: { name: ROLE.SELLER },
      });

      await tx.roles.upsert({
        where: {
          userId_roleId: { userId: pendingShop.ownerId, roleId: sellerRole.id },
        },
        update: {},
        create: { userId: pendingShop.ownerId, roleId: sellerRole.id },
      });

      return updated;
    });

    return this.toAdminShop(shop);
  }

  public async rejectShop(shopId: string, rejectedReason: string) {
    await this.findPendingShop(shopId);

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: { approvalStatus: ApprovalStatus.REJECTED, rejectedReason },
      include: shopWithOwner,
    });

    return this.toAdminShop(shop);
  }

  private async findPendingShop(shopId: string) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }
    if (shop.approvalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest('Only pending shops can be reviewed');
    }

    return shop;
  }

  private toAdminShop(shop: ShopWithOwner) {
    return {
      id: shop.id,
      shopName: shop.shopName,
      logoUrl: shop.logoUrl,
      rating: shop.rating,
      approvalStatus: shop.approvalStatus,
      status: shop.status,
      rejectedReason: shop.rejectedReason,
      ownerEmail: shop.user.email,
      ownerFullName: shop.user.profile?.fullName ?? null,
      createdAt: shop.createdAt,
    };
  }
}

export const shopService = new ShopService();
