import { getDistanceBetweenCoordinates } from "@/utils/get-distance-between-coordinates";
import type { CheckIn } from "@/entities/CheckIn";
import type { ICheckInsRepository } from "@/repositories/checkIn.repository";
import type { IGymRepository } from "@/repositories/gym.repository";
import dayjs from "dayjs";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins.error";
import { ResourceNotFoundError } from "./errors/resource-not-found.error";
import { MaxDistanceError } from "./errors/user-already-exists.error";
import { LateCheckInValidationError } from "./errors/late-check-in-validation.error";

export type CreateCheckInInput = {
  userId: string;
  gymId: string;
  userLatitude: number;
  userLongitude: number;
};

export type CreateCheckInOutput = {
  checkIn: CheckIn;
};

export type GetUserMetricsInput = {
  userId: string;
};

export type GetUserMetricsOutput = {
  checkInsCount: number;
};

export type ValidateCheckInInput = {
  checkInId: string;
};

export type ValidateCheckInOutput = {
  checkIn: CheckIn;
};

export type FetchUserCheckInsHistoryInput = {
  userId: string;
  page: number;
};

export type FetchUserCheckInsHistoryOutput = {
  checkIns: CheckIn[];
};

export interface ICheckInService {
  checkIn(params: CreateCheckInInput): Promise<CreateCheckInOutput>;
  validate(params: ValidateCheckInInput): Promise<ValidateCheckInOutput>;
  fetchByUserId(
    params: FetchUserCheckInsHistoryInput
  ): Promise<FetchUserCheckInsHistoryOutput>;
  countByUserId(params: GetUserMetricsInput): Promise<GetUserMetricsOutput>;
}

export class CheckInService implements ICheckInService {
  constructor(
    private checkInRepository: ICheckInsRepository,
    private gymRepository: IGymRepository
  ) {}

  async checkIn({
    gymId,
    userId,
    userLatitude,
    userLongitude,
  }: CreateCheckInInput): Promise<CreateCheckInOutput> {
    const gym = await this.gymRepository.findById(gymId);

    if (!gym) {
      throw new ResourceNotFoundError();
    }

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: gym.latitude,
        longitude: gym.longitude,
      }
    );

    const MAX_DISTANCE_IN_KILOMETERS = 0.1;

    if (distance > MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistanceError();
    }

    const checkInOnSameDay = await this.checkInRepository.findByUserIdOnDate(
      userId,
      new Date()
    );

    if (checkInOnSameDay) {
      throw new MaxNumberOfCheckInsError();
    }

    const checkIn = await this.checkInRepository.create({
      gymId: gymId,
      userId: userId,
    });

    return {
      checkIn,
    };
  }

  async validate({
    checkInId,
  }: ValidateCheckInInput): Promise<ValidateCheckInOutput> {
    const checkIn = await this.checkInRepository.findById(checkInId);

    if (!checkIn) {
      throw new ResourceNotFoundError();
    }

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_At,
      "minutes"
    );

    if (distanceInMinutesFromCheckInCreation > 20) {
      throw new LateCheckInValidationError();
    }

    checkIn.validated_at = new Date();

    await this.checkInRepository.save(checkIn);

    return {
      checkIn,
    };
  }

  async fetchByUserId({
    page,
    userId,
  }: FetchUserCheckInsHistoryInput): Promise<FetchUserCheckInsHistoryOutput> {
    const checkIns = await this.checkInRepository.findManyByUserId(
      userId,
      page
    );

    return {
      checkIns,
    };
  }

  async countByUserId({
    userId,
  }: GetUserMetricsInput): Promise<GetUserMetricsOutput> {
    const checkInsCount = await this.checkInRepository.countByUserId(userId);

    return {
      checkInsCount,
    };
  }
}
