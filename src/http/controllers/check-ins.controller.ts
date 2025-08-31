import type { ICheckInService } from "@/services/check-in.service";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class CheckInController {
  constructor(private readonly checkInService: ICheckInService) {}

  async create(request: FastifyRequest, response: FastifyReply) {
    const createCheckInParamsSchema = z.object({
      gymId: z.uuid(),
    });

    const createCheckInBodySchema = z.object({
      latitude: z.number().refine((value) => {
        return Math.abs(value) <= 90;
      }),
      longitude: z.number().refine((value) => {
        return Math.abs(value) <= 180;
      }),
    });

    const { gymId } = createCheckInParamsSchema.parse(request.params);
    const { latitude, longitude } = createCheckInBodySchema.parse(request.body);

    const created = await this.checkInService.checkIn({
      gymId,
      userId: request.user.id,
      userLatitude: latitude,
      userLongitude: longitude,
    });

    return response.status(201).send(created);
  }

  async history(request: FastifyRequest, response: FastifyReply) {
    const checkInHistoryQuerySchema = z.object({
      page: z.coerce.number().min(1).default(1),
    });

    const { page } = checkInHistoryQuerySchema.parse(request.query);

    const { checkIns } = await this.checkInService.fetchByUserId({
      page,
      userId: request.user.id,
    });

    return response.status(200).send({
      checkIns,
    });
  }

  async metrics(request: FastifyRequest, response: FastifyReply) {
    const { checkInsCount } = await this.checkInService.countByUserId({
      userId: request.user.id,
    });

    return response.status(200).send({
      checkInsCount,
    });
  }

  async validate(request: FastifyRequest, response: FastifyReply) {
    const validateCheckInParamsSchema = z.object({
      checkInId: z.string().uuid(),
    });

    const { checkInId } = validateCheckInParamsSchema.parse(request.params);

    await this.checkInService.validate({
      checkInId,
    });

    return response.status(204).send();
  }
}
