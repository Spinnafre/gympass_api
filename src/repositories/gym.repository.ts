import type { Gym } from "@/entities/Gym";

export interface FindManyNearbyParams {
  latitude: number;
  longitude: number;
}

export interface IGymRepository {
  create(gym: Gym): Promise<Gym>;
  findById(id: string): Promise<Gym | null>;
  findManyNearby(params: FindManyNearbyParams): Promise<Gym[]>;
  findMany(query: string, page: number): Promise<Gym[]>;
}
