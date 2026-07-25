import "dotenv/config";
import { prisma } from "@/libs/prisma";
import { hashPassword } from "@/utils/password";
import { ROLE } from "@/generated/prisma/client";

const ACCOUNTS = [
  { email: "admin@pixelmart.test", password: "Admin123!", role: ROLE.ADMIN },
  { email: "vendor@pixelmart.test", password: "Vendor123!", role: ROLE.VENDOR },
];

async function main() {
  for (const account of ACCOUNTS) {
    const hashedPassword = await hashPassword(account.password);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: account.role },
                create: { name: account.role },
              },
            },
          },
        },
      },
    });

    console.log(`Seeded ${account.role} account: ${account.email} / ${account.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
