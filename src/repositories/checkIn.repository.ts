import type { CheckIn } from "@/entities/CheckIn";

export interface ICheckInsRepository {
  findById(id: string): Promise<CheckIn | null>;
  create(data: CheckIn): Promise<CheckIn>;
  save(checkIn: CheckIn): Promise<CheckIn>;
  findManyByUserId(userId: string, page: number): Promise<CheckIn[]>;
  countByUserId(userId: string): Promise<number>;
  findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>;
}
