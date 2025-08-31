import { UserRepository } from "@/repositories/prisma/user.repository";
import { UserService } from "@/services/user.service";
import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userControlller = new UserController(userService);

  app.post("/users", userControlller.create.bind(userControlller));

  app.get(
    "/profile",
    { onRequest: [verifyJwt] },
    userControlller.profile.bind(userControlller)
  );
}
