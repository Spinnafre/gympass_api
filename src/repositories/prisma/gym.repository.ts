import { prisma } from "@/lib/prisma";
import type { FindManyNearbyParams, IGymRepository } from "../gym.repository";
import type { Gym } from "@/entities/Gym";
import { mapGymToDomain } from "../mappers/gym";

export class PrismaGymsRepository implements IGymRepository {
  async findById(id: string) {
    const gym = await prisma.gym.findUnique({
      where: {
        id,
      },
    });

    if (gym) {
      return mapGymToDomain(gym);
    }

    return null;
  }

  async findManyNearby({ latitude, longitude }: FindManyNearbyParams) {
    const gyms = await prisma.$queryRaw<Gym[]>`
      SELECT * from gyms
      WHERE ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) <= 10
    `;

    return gyms;
  }

  async findMany(query: string, page: number) {
    const gyms = await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return gyms.map(mapGymToDomain);
  }

  async create(data: Gym): Promise<Gym> {
    const gym = await prisma.gym.create({
      data,
    });

    return mapGymToDomain(gym);
  }
}
