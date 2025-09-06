import { GymService } from "@/services/gym.service";
import { GymController } from "../controllers/gym.controller";
import { PrismaGymsRepository } from "@/repositories/prisma/gym.repository";
import type { FastifyInstance } from "fastify";
import { verifyJwt } from "../middlewares/verify-jwt";
import { verifyUserRole } from "../middlewares/verify-roles";

export async function gymRoutes(app: FastifyInstance) {
  const gymRepository = new PrismaGymsRepository();
  const gymService = new GymService(gymRepository);
  const gymControlller = new GymController(gymService);

  app.addHook("onRequest", verifyJwt);

  app.post(
    "/gyms",
    { onRequest: [verifyUserRole("ADMIN")] },
    gymControlller.create.bind(gymControlller)
  );
  app.get("/gyms/search", gymControlller.search.bind(gymControlller));
  app.get("/gyms/nearby", gymControlller.nearby.bind(gymControlller));
}
