import type { User } from "@/entities/User";
import type { IUserRepository } from "@/repositories/user.repository";
import { compare } from "bcrypt";
import { InvalidCredentialsError } from "./errors/invalid-credentials.error";

export type AuthenticateUserInput = {
  email: string;
  password: string;
};

export type AuthenticateUserResponse = {
  user: User;
};

export interface IUserAuthenticationService {
  authenticate({
    email,
    password,
  }: AuthenticateUserInput): Promise<AuthenticateUserResponse>;
}

export class UserAuthenticationService implements IUserAuthenticationService {
  constructor(private repository: IUserRepository) {}

  async authenticate({
    email,
    password,
  }: AuthenticateUserInput): Promise<AuthenticateUserResponse> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    return {
      user,
    };
  }
}
