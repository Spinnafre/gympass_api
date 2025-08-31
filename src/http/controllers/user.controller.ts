import { UserAlreadyExistsError } from "@/services/errors/max-distance.error";
import type { IUserService } from "@/services/user.service";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  async create(request: FastifyRequest, response: FastifyReply) {
    const requestSchema = z.object({
      name: z.string().nonempty(),
      email: z.email().nonempty(),
      password: z.string().nonempty(),
    });

    const { email, name, password } = requestSchema.parse(request.body);

    try {
      const created = await this.userService.create({ email, name, password });

      return response.status(201).send(created);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return response.status(409).send({
          message: error.message,
          code: error.name,
        });
      }

      throw error;
    }
  }

  async profile(request: FastifyRequest, response: FastifyReply) {
    const user = await this.userService.findById(request.user.id);

    const { id, name, email, created_at } = user;

    return response.status(200).send({
      user: { id, name, email, created_at },
    });
  }
}
