import { PrismaCheckInsRepository } from "@/repositories/prisma/check-ins.repository";
import type { FastifyInstance } from "fastify";
import { verifyJwt } from "../middlewares/verify-jwt";
import { CheckInController } from "../controllers/check-ins.controller";
import { CheckInService } from "@/services/check-in.service";
import { PrismaGymsRepository } from "@/repositories/prisma/gym.repository";
import { verifyUserRole } from "../middlewares/verify-roles";

export async function checkInRoutes(app: FastifyInstance) {
  const checkInRepository = new PrismaCheckInsRepository();
  const gymRepository = new PrismaGymsRepository();
  const checkInService = new CheckInService(checkInRepository, gymRepository);
  const checkInControlller = new CheckInController(checkInService);

  app.addHook("onRequest", verifyJwt);

  app.post(
    "/checkIns",
    { onRequest: [verifyUserRole("ADMIN")] },
    checkInControlller.create.bind(checkInControlller)
  );

  app.get(
    "/check-ins/history",
    checkInControlller.history.bind(checkInControlller)
  );
  app.get(
    "/check-ins/metrics",
    checkInControlller.metrics.bind(checkInControlller)
  );

  app.post(
    "/gyms/:gymId/check-ins",
    checkInControlller.create.bind(checkInControlller)
  );
  app.patch(
    "/check-ins/:checkInId/validate",
    checkInControlller.validate.bind(checkInControlller)
  );
}
