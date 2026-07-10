import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';

/**
 * Middleware check shop owner
 * Used for routes that need shopId (e.g., add/edit product of shop)
 * Attach shop to req for controller usage: req.shop
 */
export const isShopOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Please login');
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user.userId },
    });

    if (!shop) {
      throw ApiError.notFound(
        'You do not have a shop. Please register to open a shop.',
      );
    }

    if (shop.approvalStatus !== 'APPROVED' || shop.status !== 'ACTIVE') {
      throw ApiError.forbidden(
        'Shop has not been approved or has been temporarily locked',
      );
    }

    // Attach shop to req for controller usage
    (req as any).shop = shop;
    next();
  } catch (error) {
    next(error);
  }
};
