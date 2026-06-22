import { env } from "./env";

export const corsOption = {
  origin: [env.clientWebUrl!, env.sellerWebUrl!, env.adminWebUrl!],
  credentials: true,
};
