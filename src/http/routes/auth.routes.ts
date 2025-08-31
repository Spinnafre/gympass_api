import { UserRepository } from "@/repositories/prisma/user.repository";
import { UserAuthenticationService } from "@/services/auth.service";
import type { FastifyInstance } from "fastify";
import { AuthenticationController } from "../controllers/auth.controller";

export async function authenticationRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const userAuthenticationService = new UserAuthenticationService(
    userRepository
  );
  const authControlller = new AuthenticationController(
    userAuthenticationService
  );

  app.post("/sessions", authControlller.auth.bind(authControlller));
}
