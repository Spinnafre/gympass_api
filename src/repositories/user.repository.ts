import type { User } from "@/entities/User";
import { Prisma } from "./../../generated/prisma/index.d";

export interface IUserRepository {
  create(user: Prisma.UserCreateInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
