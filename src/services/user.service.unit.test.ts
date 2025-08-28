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
import { compareSync, hash } from "bcrypt";
import { ResourceNotFoundError } from "./errors/resource-not-found.error";
import { UserAlreadyExistsError } from "./errors/max-distance.error";

describe("#UserService", () => {
  let inMemoryRepository: InMemoryUsersRepository;
  let userService: UserService;

  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    userService = new UserService(inMemoryRepository);
  });

  describe("[Account]", () => {
    test("should be able to create a user", async () => {
      const createUserInput: RegisterUserInput = {
        email: "test@mail.com",
        name: "tester",
        password: "123",
      };

      const user = await userService.create(createUserInput);

      expect(user.id).toEqual(expect.any(String));
    });

    test("should not be able to create a user with same email twice", async () => {
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

    test("should create a user password hash upon registration", async () => {
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

  describe("[Profile]", () => {
    test("should be able to get a user profile", async () => {
      const createUserInput: RegisterUserInput = {
        email: "test@mail.com",
        name: "tester",
        password: "123",
      };

      const { id } = await userService.create(createUserInput);

      const user = await userService.findById(id as string);

      expect(user?.email).toEqual(createUserInput.email);
    });

    test("should'nt be able to get a user profile with wrong id", async () => {
      await expect(userService.findById("")).rejects.instanceof(
        ResourceNotFoundError
      );
    });
  });
});
