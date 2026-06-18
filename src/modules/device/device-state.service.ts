import { BadRequestException, Injectable } from '@nestjs/common';
import { Pet, Routine } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

const FIXED_USER_ID = 'user_fixed_001';

type DeviceRoutinePayload = {
  id: string;
  name: string;
  description: string;
  question: string;
  scheduledTime: string;
  frequency: string;
  isActive: boolean;
};

type DevicePetPayload = {
  id: string;
  name: string;
  mood: string;
  happiness: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceStatePayload = {
  dueNow: boolean;
  routine: DeviceRoutinePayload | null;
  nextCheckAt: string | null;
  nextPollInSeconds: number | null;
  pet: DevicePetPayload;
};

type EvaluatedRoutine = {
  routine: Routine;
  dueAt: Date;
  nextAt: Date;
  checkedToday: boolean;
};

@Injectable()
export class DeviceStateService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeviceState(now: Date = new Date()): Promise<DeviceStatePayload> {
    const [pet, routines, checkinsToday] = await Promise.all([
      this.prisma.pet.findFirst({ where: { userId: FIXED_USER_ID } }),
      this.prisma.routine.findMany({
        where: { userId: FIXED_USER_ID, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.routineCheckin.findMany({
        where: {
          userId: FIXED_USER_ID,
          createdAt: {
            gte: this.startOfDay(now),
            lt: this.startOfNextDay(now),
          },
        },
        select: { routineId: true },
      }),
    ]);

    if (!pet) {
      throw new BadRequestException('Pet not found. Run seed first.');
    }

    return this.buildDeviceState(pet, routines, checkinsToday.map((checkin) => checkin.routineId), now);
  }

  async getCurrentDueRoutine(now: Date = new Date()): Promise<DeviceRoutinePayload | null> {
    const state = await this.getDeviceState(now);
    return state.dueNow ? state.routine : null;
  }

  private buildDeviceState(
    pet: Pet,
    routines: Routine[],
    checkedRoutineIds: string[],
    now: Date,
  ): DeviceStatePayload {
    const checkedSet = new Set(checkedRoutineIds);
    const evaluated = routines.map((routine) => this.evaluateRoutine(routine, checkedSet, now));
    const dueRoutines = evaluated
      .filter((item) => !item.checkedToday && item.dueAt.getTime() <= now.getTime())
      .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime());

    const dueRoutine = dueRoutines[0];
    if (dueRoutine) {
      return {
        dueNow: true,
        routine: this.toRoutinePayload(dueRoutine.routine),
        nextCheckAt: dueRoutine.dueAt.toISOString(),
        nextPollInSeconds: 0,
        pet: this.toPetPayload(pet),
      };
    }

    const nextRoutine = evaluated.sort((left, right) => left.nextAt.getTime() - right.nextAt.getTime())[0];

    return {
      dueNow: false,
      routine: null,
      nextCheckAt: nextRoutine ? nextRoutine.nextAt.toISOString() : null,
      nextPollInSeconds: nextRoutine
        ? Math.max(0, Math.ceil((nextRoutine.nextAt.getTime() - now.getTime()) / 1000))
        : null,
      pet: this.toPetPayload(pet),
    };
  }

  private evaluateRoutine(routine: Routine, checkedSet: Set<string>, now: Date): EvaluatedRoutine {
    const dueAt = this.resolveScheduledDate(now, routine.scheduledTime);
    const nextAt = new Date(dueAt);
    const checkedToday = checkedSet.has(routine.id);

    if (checkedToday || dueAt.getTime() <= now.getTime()) {
      nextAt.setDate(nextAt.getDate() + 1);
    }

    return {
      routine,
      dueAt,
      nextAt,
      checkedToday,
    };
  }

  private resolveScheduledDate(reference: Date, scheduledTime: string): Date {
    const [hoursText, minutesText] = scheduledTime.split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    const date = new Date(reference);
    date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
    return date;
  }

  private startOfDay(reference: Date): Date {
    const date = new Date(reference);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private startOfNextDay(reference: Date): Date {
    const date = this.startOfDay(reference);
    date.setDate(date.getDate() + 1);
    return date;
  }

  private toRoutinePayload(routine: Routine): DeviceRoutinePayload {
    return {
      id: routine.id,
      name: routine.name,
      description: routine.description,
      question: routine.question,
      scheduledTime: routine.scheduledTime,
      frequency: routine.frequency,
      isActive: routine.isActive,
    };
  }

  private toPetPayload(pet: Pet): DevicePetPayload {
    return {
      id: pet.id,
      name: pet.name,
      mood: pet.mood,
      happiness: pet.happiness,
      userId: pet.userId,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };
  }
}
