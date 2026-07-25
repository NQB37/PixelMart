import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';

/**
 * Middleware check vendor owner
 * Used for routes that need vendorId (e.g., add/edit product of vendor)
 * Attach vendor to req for controller usage: req.vendor
 */
export const isVendorOwner = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Please login');
    }

    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: req.user.userId },
    });

    if (!vendor) {
      throw ApiError.notFound(
        'You do not have a vendor account. Please register to become a vendor.',
      );
    }

    if (vendor.approvalStatus !== 'APPROVED' || vendor.status !== 'ACTIVE') {
      throw ApiError.forbidden(
        'Vendor has not been approved or has been temporarily locked',
      );
    }

    // Attach vendor to req for controller usage
    (req as any).vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};
