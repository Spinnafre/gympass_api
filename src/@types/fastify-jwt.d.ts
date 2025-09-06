import type { UserRoles } from "@/entities/User";
import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { role: string };
    user: {
      sub: string;
      role: UserRoles;
    };
  }
}
