import type { User } from "@/entities/User";
import type { IUserRepository } from "@/repositories/user.repository";
import { UserAlreadyExistsError } from "./errors/user.errors";
import { hash } from "bcrypt";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export interface IUserService {
  create({ email, name, password }: RegisterUserInput): Promise<User>;
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
}
