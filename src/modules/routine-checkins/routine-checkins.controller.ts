import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRoutineCheckinDto } from './create-routine-checkin.dto';
import { DeviceStateService } from '../device/device-state.service';
import { RoutineCheckinStatus } from './routine-checkin-status.enum';

@Controller('routine-checkins')
export class RoutineCheckinsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceStateService: DeviceStateService,
  ) {}

  @Post()
  async create(@Body() body: CreateRoutineCheckinDto) {
    const now = new Date();

    await this.deviceStateService.cancelExpiredRoutineCheckins(now);

    const routine = await this.prisma.routine.findUnique({ where: { id: body.routineId } });
    if (!routine) {
      throw new BadRequestException('Routine not found.');
    }

    if (await this.deviceStateService.isRoutineResponseExpired(routine, now)) {
      throw new BadRequestException('Routine response window expired. Routine was canceled.');
    }

    const pet = await this.prisma.pet.findFirst({ where: { userId: 'user_fixed_001' } });
    if (!pet) {
      throw new BadRequestException('Pet not found. Run seed first.');
    }

    const { mood, delta, message } = this.resolveMoodRule(body.status);
    const nextHappiness = Math.max(0, Math.min(100, pet.happiness + delta));

    const [checkin, updatedPet] = await this.prisma.$transaction([
      this.prisma.routineCheckin.create({
        data: {
          routineId: routine.id,
          userId: 'user_fixed_001',
          status: body.status,
        },
      }),
      this.prisma.pet.update({
        where: { id: pet.id },
        data: {
          mood,
          happiness: nextHappiness,
          updatedAt: new Date(),
        },
      }),
    ]);

    await this.prisma.petEvent.create({
      data: {
        petId: updatedPet.id,
        type: 'routine_checkin',
        payloadJson: JSON.stringify({
          routineId: routine.id,
          status: body.status,
          happinessDelta: delta,
        }),
      },
    });

    const deviceState = await this.deviceStateService.getDeviceState(now);

    return {
      checkin,
      pet: deviceState.pet,
      message,
      dueNow: deviceState.dueNow,
      routine: deviceState.routine,
      nextCheckAt: deviceState.nextCheckAt,
      nextPollInSeconds: deviceState.nextPollInSeconds,
    };
  }

  private resolveMoodRule(status: RoutineCheckinStatus): {
    mood: string;
    delta: number;
    message: string;
  } {
    switch (status) {
      case RoutineCheckinStatus.DONE:
        return { mood: 'happy', delta: 10, message: 'Good job! HabitPet is happy.' };
      case RoutineCheckinStatus.NOT_DONE:
        return { mood: 'sad', delta: -5, message: 'No worries, let us try again soon.' };
      case RoutineCheckinStatus.POSTPONED:
        return { mood: 'sad', delta: -5, message: 'Okay, postponed for now. We will try again tomorrow.' };
      default:
        return { mood: 'sad', delta: -5, message: 'No worries, let us try again soon.' };
    }
  }
}
