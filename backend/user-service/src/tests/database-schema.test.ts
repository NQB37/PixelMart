import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { prisma } from '../lib/prisma.js';

test('signup token persistence table exists in the database schema', async () => {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT to_regclass('public.refresh_tokens') IS NOT NULL AS exists
  `;

  assert.equal(rows[0]?.exists, true);
});

after(async () => {
  await prisma.$disconnect();
});
