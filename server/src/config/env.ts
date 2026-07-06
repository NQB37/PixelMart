import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("Missing required JWT environment variables");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  // website urls
  clientWebUrl: process.env.CLIENT_WEB_URL,
  sellerWebUrl: process.env.SELLER_WEB_URL,
  adminWebUrl: process.env.ADMIN_WEB_URL,
  // jwt
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "30m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "14d",
  refreshTokenExpiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 14,
  // cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
