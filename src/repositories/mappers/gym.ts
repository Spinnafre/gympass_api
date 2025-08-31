import type { Gym } from "@/entities/Gym";
import prisma from "@prisma/client";

export function mapGymToDomain(gym: prisma.Gym): Gym {
  const { id, description, latitude, longitude, phone, title } = gym;

  return {
    id,
    description: description,
    latitude: Number(latitude),
    longitude: Number(longitude),
    phone,
    title,
  };
}
