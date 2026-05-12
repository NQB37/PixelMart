import { randomUUID } from 'node:crypto';
import { Provider, RoleType, Status } from '../generated/prisma/enums.js';
import { REFRESH_TOKEN_EXPIRY } from '../config/env.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { hashToken } from '../lib/tokenHash.js';
import { AppError } from '../utils/app-error.js';

type Credentials = {
  email: string;
  password: string;
};

const selectAuthUser = {
  id: true,
  email: true,
  password: true,
  status: true,
  isActive: true,
  role: {
    select: {
      name: true,
    },
  },
};

const publicUserSelect = {
  id: true,
  email: true,
  status: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      name: true,
    },
  },
};

const toAccessPayload = (user: {
  id: string;
  email: string;
  status: string;
  role: { name: string };
}) => ({
  sub: user.id,
  email: user.email,
  role: user.role.name,
  status: user.status,
  type: 'access' as const,
});

const createRefreshToken = async (userId: string) => {
  const id = randomUUID();
  const token = signRefreshToken({
    sub: userId,
    jti: id,
    type: 'refresh',
  });

  await prisma.refreshToken.create({
    data: {
      id,
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    },
  });

  return token;
};

const issueTokens = async (user: {
  id: string;
  email: string;
  status: string;
  role: { name: string };
}) => ({
  accessToken: signAccessToken(toAccessPayload(user)),
  refreshToken: await createRefreshToken(user.id),
});

export const register = async ({ email, password }: Credentials) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const customerRole = await tx.role.upsert({
      where: { name: RoleType.CUSTOMER },
      update: {},
      create: { name: RoleType.CUSTOMER },
    });

    const createdUser = await tx.user.create({
      data: {
        email,
        password: passwordHash,
        roleId: customerRole.id,
        accounts: {
          create: {
            provider: Provider.CREDENTIAL,
            providerAccountId: email,
          },
        },
      },
      select: publicUserSelect,
    });

    return createdUser;
  });

  return {
    user,
    ...(await issueTokens(user)),
  };
};

export const login = async ({ email, password }: Credentials) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: selectAuthUser,
  });

  if (!user?.password || !(await verifyPassword(password, user.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.isActive || user.status !== Status.ACTIVE) {
    throw new AppError(403, 'User account is not active');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      isActive: user.isActive,
      role: user.role,
    },
    ...(await issueTokens(user)),
  };
};

export const refresh = async (refreshToken: string) => {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashToken(refreshToken),
    },
  });

  if (
    !tokenRecord ||
    tokenRecord.id !== payload.jti ||
    tokenRecord.userId !== payload.sub ||
    tokenRecord.revokedAt ||
    tokenRecord.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: selectAuthUser,
  });

  if (!user || !user.isActive || user.status !== Status.ACTIVE) {
    throw new AppError(401, 'Invalid refresh token');
  }

  const nextRefreshToken = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const id = randomUUID();
    const token = signRefreshToken({
      sub: user.id,
      jti: id,
      type: 'refresh',
    });

    await tx.refreshToken.create({
      data: {
        id,
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      },
    });

    return token;
  });

  return {
    accessToken: signAccessToken(toAccessPayload(user)),
    refreshToken: nextRefreshToken,
  };
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) {
    return;
  }

  await prisma.refreshToken
    .update({
      where: {
        tokenHash: hashToken(refreshToken),
      },
      data: {
        revokedAt: new Date(),
      },
    })
    .catch(() => undefined);
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};
