import { type FastifyInstance } from "fastify";
import { userRoutes } from "./user.routes";
import { authenticationRoutes } from "./auth.routes";

export async function appRoutes(app: FastifyInstance) {
  app.get("/_health", async (request, reply) => {
    return { message: "hello world" };
  });

  app.register(userRoutes);
  app.register(authenticationRoutes);
}
