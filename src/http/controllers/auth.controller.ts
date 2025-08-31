import type { IUserAuthenticationService } from "@/services/auth.service";
import { InvalidCredentialsError } from "@/services/errors/invalid-credentials.error";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class AuthenticationController {
  constructor(
    private readonly authenticationService: IUserAuthenticationService
  ) {}

  async auth(request: FastifyRequest, response: FastifyReply) {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(request.body);

    try {
      const { user } = await this.authenticationService.authenticate({
        email,
        password,
      });

      const token = await response.jwtSign(
        { name: user.name },
        {
          sign: {
            sub: user.id as string,
            expiresIn: "7d",
          },
        }
      );

      return response.status(200).send({
        token,
      });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return response.status(400).send({ message: error.message });
      }
    }
  }
}
