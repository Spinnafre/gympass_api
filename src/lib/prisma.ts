import { env } from "@/config/env";
import { PrismaClient } from "generated/prisma";

export const prisma = new PrismaClient({
  log: env.NODE_ENV == "prod" ? [] : ["query"],
});
