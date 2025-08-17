import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["prod", "dev", "test"]).default("dev"),
  PORT: z.coerce.number().default(8080),
  HOST: z.coerce.string().default("0.0.0.0"),
  DATABASE_URL: z.coerce.string().nonempty(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(_env.error.format());
  throw new Error("❌ Invalid environment variables");
}

export const env = _env.data;
