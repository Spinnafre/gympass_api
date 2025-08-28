import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { ICheckInsRepository } from "@/repositories/checkIn.repository";
import type { IGymRepository } from "@/repositories/gym.repository";
import { CheckInService, type ICheckInService } from "./check-in.service";
import { ResourceNotFoundError } from "./errors/resource-not-found.error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins.error";
import { MaxDistanceError } from "./errors/user-already-exists.error";
import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-in-repository";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gym-repository";

describe("#CheckIn", () => {
  let inMemoryCheckInRepository: InMemoryCheckInsRepository;
  let inMemoryGymRepository: IGymRepository;
  let sut: ICheckInService;

  beforeEach(() => {
    inMemoryCheckInRepository = new InMemoryCheckInsRepository();
    inMemoryGymRepository = new InMemoryGymsRepository();
    sut = new CheckInService(inMemoryCheckInRepository, inMemoryGymRepository);
  });

  describe("[Check-In]", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("should be able to check in", async () => {
      await inMemoryGymRepository.create({
        id: "gym-01",
        title: "JavaScript Gym",
        description: "",
        phone: "",
        latitude: -27.2092052,
        longitude: -49.6401091,
      });

      const input = {
        userId: "user-123",
        gymId: "gym-01",
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      };

      const { checkIn } = await sut.checkIn(input);

      expect(checkIn.id).toEqual(expect.any(String));
    });
    test("should not be able to check in when the gym is not found", async () => {
      await inMemoryGymRepository.create({
        id: "gym-01",
        title: "JavaScript Gym",
        description: "",
        phone: "",
        latitude: -27.2092052,
        longitude: -49.6401091,
      });

      const input = {
        userId: "user-123",
        gymId: "gym-1",
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      };

      await expect(sut.checkIn(input)).rejects.instanceOf(
        ResourceNotFoundError
      );
    });

    test("should not be able to check in twice in the same day", async () => {
      vi.setSystemTime(new Date(2025, 7, 24, 8, 0, 0));

      await inMemoryGymRepository.create({
        id: "gym-01",
        title: "JavaScript Gym",
        description: "",
        phone: "",
        latitude: -27.2092052,
        longitude: -49.6401091,
      });

      const input = {
        userId: "user-123",
        gymId: "gym-01",
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      };

      await sut.checkIn(input);

      await expect(sut.checkIn(input)).rejects.instanceOf(
        MaxNumberOfCheckInsError
      );
    });
    test("should not be able to check in on distant gym", async () => {
      await inMemoryGymRepository.create({
        id: "gym-01",
        title: "JavaScript Gym",
        description: "",
        phone: "",
        latitude: -27.2092052,
        longitude: -49.6401091,
      });

      const input = {
        userId: "user-123",
        gymId: "gym-01",
        userLatitude: -27.0747279,
        userLongitude: -49.4889672,
      };

      await expect(sut.checkIn(input)).rejects.instanceOf(MaxDistanceError);
    });
  });
  describe("[Validate]", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });
    test("should be able to validate the check-in", async () => {
      const createdCheckIn = await inMemoryCheckInRepository.create({
        gymId: "gym-01",
        userId: "user-01",
      });

      const { checkIn } = await sut.validate({
        checkInId: createdCheckIn.id as string,
      });

      expect(checkIn.validated_at).toEqual(expect.any(Date));
      expect(inMemoryCheckInRepository.items[0]?.validated_at).toEqual(
        expect.any(Date)
      );
    });

    test("should not be able to validate an inexistent check-in", async () => {
      await expect(() =>
        sut.validate({
          checkInId: "inexistent-check-in-id",
        })
      ).rejects.toBeInstanceOf(ResourceNotFoundError);
    });

    test("should not be able to validate the check-in after 20 minutes of its creation", async () => {
      vi.setSystemTime(new Date(2025, 7, 25, 13, 40));

      const createdCheckIn = await inMemoryCheckInRepository.create({
        gymId: "gym-01",
        userId: "user-01",
      });

      const twentyOneMinutesInMs = 1000 * 60 * 21;

      vi.advanceTimersByTime(twentyOneMinutesInMs);

      await expect(
        sut.validate({
          checkInId: createdCheckIn.id as string,
        })
      ).rejects.toBeInstanceOf(Error);
    });
  });

  describe("[FetchByUser]", () => {
    test("should be able to fetch check-in history", async () => {
      await inMemoryCheckInRepository.create({
        gymId: "gym-01",
        userId: "user-01",
      });

      await inMemoryCheckInRepository.create({
        gymId: "gym-02",
        userId: "user-01",
      });

      const { checkIns } = await sut.fetchByUserId({
        userId: "user-01",
        page: 1,
      });

      expect(checkIns).toHaveLength(2);
      expect(checkIns).toEqual([
        expect.objectContaining({
          gymId: "gym-01",
          userId: "user-01",
        }),
        expect.objectContaining({
          gymId: "gym-02",
          userId: "user-01",
        }),
      ]);
    });
    test("should be able to fetch paginated check-in history", async () => {
      for (let i = 1; i <= 22; i++) {
        await inMemoryCheckInRepository.create({
          gymId: `gym-${i}`,
          userId: "user-01",
        });
      }

      const { checkIns } = await sut.fetchByUserId({
        userId: "user-01",
        page: 2,
      });

      expect(checkIns).toHaveLength(2);
      expect(checkIns).toEqual([
        expect.objectContaining({
          gymId: "gym-21",
          userId: "user-01",
        }),
        expect.objectContaining({
          gymId: "gym-22",
          userId: "user-01",
        }),
      ]);
    });
  });
  describe("[CountByUser]", () => {
    test("should be able to get check-ins count from metrics", async () => {
      await inMemoryCheckInRepository.create({
        gymId: "gym-01",
        userId: "user-01",
      });

      await inMemoryCheckInRepository.create({
        gymId: "gym-02",
        userId: "user-01",
      });

      const { checkInsCount } = await sut.countByUserId({
        userId: "user-01",
      });

      expect(checkInsCount).toEqual(2);
    });
  });
});
