import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '@/app';
import { prisma } from '@/libs/prisma';
import { JwtPayload } from '@/utils/jwt';

describe('Auth Refresh Token Integration Tests', () => {
  const cleanupUser = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  };

  const testPassword = 'Password123!';

  it('should register a new user successfully', async () => {
    const email = `test-reg-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password: testPassword });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.roles).toEqual(['CUSTOMER']);
      expect(res.body.data.accessToken).toBeDefined();

      const decoded = jwt.decode(res.body.data.accessToken) as JwtPayload;
      expect(decoded.roles).toEqual(['CUSTOMER']);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const hasRefreshCookie = cookies.some((c: string) =>
        c.includes('refreshToken='),
      );
      expect(hasRefreshCookie).toBe(true);
    } finally {
      await cleanupUser(email);
    }
  });

  it('should refresh access token using valid refresh token cookie', async () => {
    const email = `test-ref-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      // 1. Register
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password: testPassword });

      const cookies1 = regRes.headers['set-cookie'];
      const cookie1 = cookies1.find((c: string) => c.includes('refreshToken='));

      // 2. Refresh
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [cookie1]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      const cookies2 = res.headers['set-cookie'];
      expect(cookies2).toBeDefined();
      const newRefreshCookie = cookies2.find((c: string) =>
        c.includes('refreshToken='),
      );
      expect(newRefreshCookie).toBeDefined();
    } finally {
      await cleanupUser(email);
    }
  });

  it('should reject refresh when refreshToken cookie is missing', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No refresh token provided');
  });

  it('should implement token rotation and revoke all tokens if refresh token is reused', async () => {
    const email = `test-rot-${Date.now()}@example.com`;
    await cleanupUser(email);

    try {
      // 1. Register & Login to get fresh tokens
      const loginRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ email, password: testPassword });

      const cookies1 = loginRes.headers['set-cookie'];
      const cookie1 = cookies1.find((c: string) => c.includes('refreshToken='));

      // 2. First refresh (valid) -> returns new cookie2
      const refreshRes1 = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [cookie1]);

      expect(refreshRes1.status).toBe(200);
      const cookies2 = refreshRes1.headers['set-cookie'];
      const cookie2 = cookies2.find((c: string) => c.includes('refreshToken='));

      // 3. Second refresh using cookie1 (replay attack)
      const replayRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [cookie1]);

      expect(replayRes.status).toBe(401);

      // 4. Verify cookie2 is now also revoked
      const revokedRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [cookie2]);

      expect(revokedRes.status).toBe(401);
    } finally {
      await cleanupUser(email);
    }
  });
});
