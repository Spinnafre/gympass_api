import type { User } from "@/entities/User";
import type { IUserRepository } from "../user.repository";
import type { Prisma } from "generated/prisma";
import { randomUUID } from "crypto";

export class InMemoryUsersRepository implements IUserRepository {
  public items: User[] = [];

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async create(data: Prisma.UserCreateInput) {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      created_at: new Date(),
    };

    this.items.push(user);

    return user;
  }
}
