import { InMemoryUsersRepository } from "./../repositories/in-memory/in-memory-user-repository";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterEach,
  beforeEach,
} from "vitest";
import { UserService, type RegisterUserInput } from "./user.service";
import { UserAlreadyExistsError } from "./errors/user.errors";
import { compareSync, hash } from "bcrypt";

describe("#UserService", () => {
  let inMemoryRepository: InMemoryUsersRepository;
  let userService: UserService;

  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    userService = new UserService(inMemoryRepository);
  });

  test("should be able to create an user", async () => {
    const createUserInput: RegisterUserInput = {
      email: "test@mail.com",
      name: "tester",
      password: "123",
    };

    const user = await userService.create(createUserInput);

    expect(user.id).toEqual(expect.any(String));
  });

  test("should not be able to create an user with same email twice", async () => {
    const createUserInput: RegisterUserInput = {
      email: "test@mail.com",
      name: "tester",
      password: "123",
    };

    await userService.create(createUserInput);

    await expect(userService.create(createUserInput)).rejects.toBeInstanceOf(
      UserAlreadyExistsError
    );
  });

  test("should create an user password hash upon registration", async () => {
    const password = "123";

    const createUserInput: RegisterUserInput = {
      email: "test@mail.com",
      name: "tester",
      password,
    };

    const createdUser = await userService.create(createUserInput);

    expect(compareSync(password, createdUser.password)).toBeTruthy();
  });
});
