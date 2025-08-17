import type { User } from "@/entities/User";
import type { Prisma } from "generated/prisma";
import type { IUserRepository } from "../user.repository";
import { prisma } from "@/lib/prisma";

export class UserRepository implements IUserRepository {
  async create(user: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data: user,
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
