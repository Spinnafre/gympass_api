import type { IUserRepository } from "@/repositories/user.repository";
import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryUsersRepository } from "./../repositories/in-memory/in-memory-user-repository";
import {
  UserAuthenticationService,
  type AuthenticateUserInput,
  type IUserAuthenticationService,
} from "./auth.service";
import { hash } from "bcrypt";

describe("#Authentication", () => {
  let inMemoryRepository: IUserRepository;
  let userService: IUserAuthenticationService;

  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    userService = new UserAuthenticationService(inMemoryRepository);
  });

  test("should be able to authenticate a user", async () => {
    const authUserInput: AuthenticateUserInput = {
      email: "test@mail.com",
      password: "123",
    };

    await inMemoryRepository.create({
      email: "test@mail.com",
      name: "tester",
      password: await hash(authUserInput.password, 6),
    });

    const { user } = await userService.authenticate(authUserInput);

    expect(user.id).toEqual(expect.any(String));
  });
});
