import { prisma } from '@/libs/prisma';
import { ApiError } from '@/utils/ApiError';
import { ListUsersQuery } from './user.validation';

class UserService {
  public async listUsers({ page, limit, search, role, isActive, isDeleted }: ListUsersQuery) {
    const where = {
      deletedAt: isDeleted ? { not: null } : null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { profile: { fullName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(role && { roles: { some: { role: { name: role } } } }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true, roles: { include: { role: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        roles: user.roles.map((r) => r.role.name),
        isActive: user.isActive,
        deletedAt: user.deletedAt,
        createdAt: user.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public async updateStatus(userId: string, isActive: boolean, requesterId: string) {
    if (userId === requesterId) {
      throw ApiError.badRequest('You cannot change your own account status');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });
  }

  public async softDelete(userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deletedAt: new Date() },
      select: { id: true, email: true, isActive: true, deletedAt: true },
    });
  }

  public async restore(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    if (!user.deletedAt) {
      throw ApiError.badRequest('User is not deleted');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: true, deletedAt: null },
      select: { id: true, email: true, isActive: true, deletedAt: true },
    });
  }

  public async permanentlyDelete(userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    if (!user.deletedAt) {
      throw ApiError.badRequest('User must be deleted before it can be permanently removed');
    }

    await prisma.user.delete({ where: { id: userId } });
  }
}

export const userService = new UserService();
