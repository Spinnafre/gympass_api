import { prisma } from "@/lib/prisma";
import type { IUserRepository } from "../user.repository";
import type { Prisma } from "@prisma/client";

export class UserRepository implements IUserRepository {
  async create(user: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data: user,
    });
  }
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }
}
