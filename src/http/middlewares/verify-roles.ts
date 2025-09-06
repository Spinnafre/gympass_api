import type { UserRoles } from "@/entities/User";
import type { FastifyReply, FastifyRequest } from "fastify";

export function verifyUserRole(roleToVerify: UserRoles) {
  return async (request: FastifyRequest, response: FastifyReply) => {
    const { role } = request.user;

    if (roleToVerify !== role) {
      response.status(401).send({ message: "Unauthorized." });
    }
  };
}
