import app from "@/app";
import { env } from "@/config/env";

const startServer = async () => {
  try {
    // Database connection sẽ thêm ở Phase 2
    // await prisma.$connect();

    app.listen(env.port, () => {
      console.log(`
Environment : ${env.nodeEnv}
Port        : ${env.port}
Health      : http://localhost:${env.port}/api/v1/health
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
