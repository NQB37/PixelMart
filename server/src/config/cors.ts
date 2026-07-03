import { env } from './env';

const origins = [env.clientWebUrl!, env.sellerWebUrl!, env.adminWebUrl!];

const allowedOrigins = origins.flatMap((origin) =>
  origin && origin.includes('localhost')
    ? [origin, origin.replace('localhost', '127.0.0.1')]
    : [origin],
);

export const corsOption = {
  origin: allowedOrigins,
  credentials: true,
};
