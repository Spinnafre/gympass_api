import type { IGymService } from "@/services/gym.service";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class GymController {
  constructor(private readonly gymService: IGymService) {}

  async create(request: FastifyRequest, response: FastifyReply) {
    const createGymBodySchema = z.object({
      title: z.string(),
      description: z.string().nullable(),
      phone: z.string().nullable(),
      latitude: z.number().refine((value) => {
        return Math.abs(value) <= 90;
      }),
      longitude: z.number().refine((value) => {
        return Math.abs(value) <= 180;
      }),
    });

    const { title, description, phone, latitude, longitude } =
      createGymBodySchema.parse(request.body);

    const created = await this.gymService.create({
      title,
      description,
      phone,
      latitude,
      longitude,
    });

    return response.status(201).send(created);
  }

  async nearby(request: FastifyRequest, response: FastifyReply) {
    const nearbyGymsQuerySchema = z.object({
      latitude: z.coerce.number().refine((value) => {
        return Math.abs(value) <= 90;
      }),
      longitude: z.coerce.number().refine((value) => {
        return Math.abs(value) <= 180;
      }),
    });

    const { latitude, longitude } = nearbyGymsQuerySchema.parse(request.query);

    const { gyms } = await this.gymService.findManyNearby({
      userLatitude: latitude,
      userLongitude: longitude,
    });

    return response.status(200).send({
      gyms,
    });
  }

  async search(request: FastifyRequest, response: FastifyReply) {
    const searchGymsQuerySchema = z.object({
      q: z.string(),
      page: z.coerce.number().min(1).default(1),
    });

    const { q, page } = searchGymsQuerySchema.parse(request.query);

    const { gyms } = await this.gymService.findMany({
      query: q,
      page,
    });

    return response.status(200).send({
      gyms,
    });
  }
}
