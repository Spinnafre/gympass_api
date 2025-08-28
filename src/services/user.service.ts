import type { User } from "@/entities/User";
import type { IUserRepository } from "@/repositories/user.repository";
import { hash } from "bcrypt";
import { ResourceNotFoundError } from "./errors/resource-not-found.error";
import { UserAlreadyExistsError } from "./errors/max-distance.error";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export interface IUserService {
  create({ email, name, password }: RegisterUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
}

export class UserService implements IUserService {
  constructor(private repository: IUserRepository) {}

  async create({ email, name, password }: RegisterUserInput): Promise<User> {
    const userWithSameEmail = await this.repository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const password_hash = await hash(password, 6);

    return await this.repository.create({
      email,
      name,
      password: password_hash,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    return user;
  }
}
