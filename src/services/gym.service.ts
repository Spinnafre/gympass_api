import type { Gym } from "@/entities/Gym";
import type { IGymRepository } from "@/repositories/gym.repository";

export type RegisterGymInput = {
  title: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
};

export type RegisterGymOutput = {
  gym: Gym;
};

export type SearchGymsInput = {
  query: string;
  page: number;
};

export type SearchGymsOutput = {
  gyms: Gym[];
};

export type FetchNearbyGymsUseCaseInput = {
  userLatitude: number;
  userLongitude: number;
};

export type FetchNearbyGymsUseCaseOutput = {
  gyms: Gym[];
};

export interface IGymService {
  create(params: RegisterGymInput): Promise<RegisterGymOutput>;
  findManyNearby(
    params: FetchNearbyGymsUseCaseInput
  ): Promise<FetchNearbyGymsUseCaseOutput>;
  findMany(params: SearchGymsInput): Promise<SearchGymsOutput>;
}

export class GymService implements IGymService {
  constructor(private repository: IGymRepository) {}

  async create({
    description,
    latitude,
    longitude,
    phone,
    title,
  }: RegisterGymInput): Promise<RegisterGymOutput> {
    const gym = await this.repository.create({
      description,
      latitude,
      longitude,
      phone,
      title,
    });

    return {
      gym,
    };
  }

  async findManyNearby({
    userLatitude,
    userLongitude,
  }: FetchNearbyGymsUseCaseInput): Promise<FetchNearbyGymsUseCaseOutput> {
    const gyms = await this.repository.findManyNearby({
      latitude: userLatitude,
      longitude: userLongitude,
    });

    return {
      gyms,
    };
  }

  async findMany({ page, query }: SearchGymsInput): Promise<SearchGymsOutput> {
    const gyms = await this.repository.findMany(query, page);

    return {
      gyms,
    };
  }
}
