import { UserRepository } from "@/repositories/prisma/user.repository";
import { UserService } from "@/services/user.service";
import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user.controller";

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userControlller = new UserController(userService);

  app.get("/user", async (request, reply) => {
    return { hello: "world" };
  });

  app.post("/user", userControlller.create.bind(userControlller));
}
