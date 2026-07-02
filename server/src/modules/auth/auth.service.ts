import { prisma } from "@/libs/prisma";
import { LoginInput, RegisterInput } from "./auth.validation";
import { ApiError } from "@/utils/ApiError";
import { comparePassword, hashPassword } from "@/utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { env } from "@/config/env";

class AuthService {
  public async register(data: RegisterInput) {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw ApiError.conflict("Email already exists!");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Format user response
    const userResponse = {
      id: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
    );

    return { user: userResponse, accessToken, refreshToken };
  }

  public async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Check active
    if (!user.isActive) {
      throw ApiError.forbidden("Your account is banned!");
    }

    // Compare password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
    );

    // Format user response
    const userResponse = {
      id: user.id,
      email: user.email,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  public async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  public async refreshToken(oldRefreshToken: string) {
    const payload = verifyRefreshToken(oldRefreshToken);

    // Check if refresh token is in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });
    if (!storedToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId },
      });
      throw ApiError.unauthorized("Refresh token not found");
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    // Generate new token pair
    const { accessToken, refreshToken } = await this.generateTokenPair(
      user.id,
      user.email,
    );

    return { accessToken, refreshToken };
  }

  private async generateTokenPair(userId: string, email: string) {
    const payload = {
      userId,
      email,
      jti: Math.random().toString(36).substring(2) + Date.now().toString(36),
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(
          Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // Cleanup expired tokens
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
