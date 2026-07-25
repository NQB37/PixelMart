import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';
import { ApprovalStatus, ROLE, VendorStatus } from '@/generated/prisma/client';
import { CreateVendorInput, ListVendorsQuery } from './vendor.validation';

const vendorWithOwner = {
  user: { select: { email: true, profile: { select: { fullName: true } } } },
} as const;

type VendorWithOwner = {
  id: string;
  vendorName: string;
  logoUrl: string | null;
  rating: number;
  approvalStatus: ApprovalStatus;
  status: VendorStatus;
  rejectedReason: string | null;
  createdAt: Date;
  user: { email: string; profile: { fullName: string } | null };
};

class VendorService {
  // === VENDOR ROUTES ===
  public async getMyVendor(userId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { ownerId: userId },
      include: { verification: true },
    });
    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    return vendor;
  }

  public async createVendor(userId: string, data: CreateVendorInput) {
    const existingVendor = await prisma.vendor.findUnique({
      where: { ownerId: userId },
    });
    if (existingVendor) {
      throw ApiError.conflict('You already have a vendor account');
    }

    const { vendorName, logoUrl, ...verification } = data;

    return prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.create({
        data: { vendorName, logoUrl, ownerId: userId },
      });

      await tx.vendorVerification.create({
        data: { ...verification, vendorId: vendor.id },
      });

      return vendor;
    });
  }

  // ===== ADMIN ONLY =====
  public async getAllVendors({
    page,
    limit,
    search,
    approvalStatus,
  }: ListVendorsQuery) {
    const where = {
      approvalStatus,
      ...(search && {
        OR: [
          { vendorName: { contains: search, mode: 'insensitive' as const } },
          {
            user: { email: { contains: search, mode: 'insensitive' as const } },
          },
        ],
      }),
    };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: vendorWithOwner,
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      vendors: vendors.map((vendor) => this.toAdminVendor(vendor)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public async getVendorById(vendorId: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { ...vendorWithOwner, verification: true },
    });
    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }

    return { ...this.toAdminVendor(vendor), verification: vendor.verification };
  }

  public async approveVendor(vendorId: string) {
    const pendingVendor = await this.findPendingVendor(vendorId);

    const vendor = await prisma.$transaction(async (tx) => {
      const updated = await tx.vendor.update({
        where: { id: vendorId },
        data: { approvalStatus: ApprovalStatus.APPROVED, rejectedReason: null },
        include: vendorWithOwner,
      });

      const vendorRole = await tx.role.upsert({
        where: { name: ROLE.VENDOR },
        update: {},
        create: { name: ROLE.VENDOR },
      });

      await tx.roles.upsert({
        where: {
          userId_roleId: { userId: pendingVendor.ownerId, roleId: vendorRole.id },
        },
        update: {},
        create: { userId: pendingVendor.ownerId, roleId: vendorRole.id },
      });

      return updated;
    });

    return this.toAdminVendor(vendor);
  }

  public async rejectVendor(vendorId: string, rejectedReason: string) {
    await this.findPendingVendor(vendorId);

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { approvalStatus: ApprovalStatus.REJECTED, rejectedReason },
      include: vendorWithOwner,
    });

    return this.toAdminVendor(vendor);
  }

  private async findPendingVendor(vendorId: string) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw ApiError.notFound('Vendor not found');
    }
    if (vendor.approvalStatus !== ApprovalStatus.PENDING) {
      throw ApiError.badRequest('Only pending vendors can be reviewed');
    }

    return vendor;
  }

  private toAdminVendor(vendor: VendorWithOwner) {
    return {
      id: vendor.id,
      vendorName: vendor.vendorName,
      logoUrl: vendor.logoUrl,
      rating: vendor.rating,
      approvalStatus: vendor.approvalStatus,
      status: vendor.status,
      rejectedReason: vendor.rejectedReason,
      ownerEmail: vendor.user.email,
      ownerFullName: vendor.user.profile?.fullName ?? null,
      createdAt: vendor.createdAt,
    };
  }
}

export const vendorService = new VendorService();
