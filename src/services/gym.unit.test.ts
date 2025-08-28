import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { IGymRepository } from "@/repositories/gym.repository";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gym-repository";
import { GymService, type IGymService } from "./gym.service";

describe("#Gym", () => {
  let inMemoryGymRepository: IGymRepository;
  let sut: IGymService;

  beforeEach(() => {
    inMemoryGymRepository = new InMemoryGymsRepository();
    sut = new GymService(inMemoryGymRepository);
  });

  test("should be able to create a gym", async () => {
    const input = {
      id: "gym-01",
      title: "JavaScript Gym",
      description: "",
      phone: "",
      latitude: -27.2092052,
      longitude: -49.6401091,
    };

    const { gym } = await sut.create(input);

    expect(gym.id).toEqual(expect.any(String));
  });
  test("should be able to fetch nearby gyms", async () => {
    await inMemoryGymRepository.create({
      title: "Near Gym",
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    });

    await inMemoryGymRepository.create({
      title: "Far Gym",
      description: null,
      phone: null,
      latitude: -27.0610928,
      longitude: -49.5229501,
    });

    const input = {
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
    };

    const { gyms } = await sut.findManyNearby(input);

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([expect.objectContaining({ title: "Near Gym" })]);
  });
  test("should be able to search for gyms", async () => {
    await inMemoryGymRepository.create({
      title: "JavaScript Gym",
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    });

    await inMemoryGymRepository.create({
      title: "TypeScript Gym",
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    });

    const { gyms } = await sut.findMany({
      query: "JavaScript",
      page: 1,
    });

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([
      expect.objectContaining({ title: "JavaScript Gym" }),
    ]);
  });

  test("should be able to fetch paginated gym search", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryGymRepository.create({
        title: `JavaScript Gym ${i}`,
        description: null,
        phone: null,
        latitude: -27.2092052,
        longitude: -49.6401091,
      });
    }

    const { gyms } = await sut.findMany({
      query: "JavaScript",
      page: 2,
    });

    expect(gyms).toHaveLength(2);
    expect(gyms).toEqual([
      expect.objectContaining({ title: "JavaScript Gym 21" }),
      expect.objectContaining({ title: "JavaScript Gym 22" }),
    ]);
  });
});
