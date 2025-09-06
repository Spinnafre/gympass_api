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
        {
          role: user.role,
        },
        {
          sign: {
            sub: user.id as string,
            expiresIn: "10m",
          },
        }
      );

      const refresh_token = await response.jwtSign(
        {
          role: user.role,
        },
        {
          sign: {
            sub: user.id as string,
            expiresIn: "7d",
          },
        }
      );

      return response
        .setCookie("refresh-token", refresh_token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: true,
          signed: false,
        })
        .status(200)
        .send({
          token,
        });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return response.status(400).send({ message: error.message });
      }
    }
  }

  async refresh(request: FastifyRequest, response: FastifyReply) {
    await request.jwtVerify({
      onlyCookie: true,
    });

    const { role, sub } = request.user;

    const token = await response.jwtSign(
      {
        role: role,
      },
      {
        sign: {
          sub: sub,
          expiresIn: "10m",
        },
      }
    );

    const refresh_token = await response.jwtSign(
      {
        role: role,
      },
      {
        sign: {
          sub: sub,
          expiresIn: "7d",
        },
      }
    );

    return response
      .setCookie("refresh-token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: true,
        signed: false,
      })
      .status(200)
      .send({
        token,
      });
  }
}
