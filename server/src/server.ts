import app from "@/app";
import { env } from "@/config/env";

const startServer = async () => {
  try {
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
