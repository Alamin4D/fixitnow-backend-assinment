import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  app_url: process.env.APP_URL || "http://localhost:3000",
  database_url: process.env.DATABASE_URL!,
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "access-secret",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || "",
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export default config;