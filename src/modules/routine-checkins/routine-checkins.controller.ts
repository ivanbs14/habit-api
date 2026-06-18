import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRoutineCheckinDto } from './create-routine-checkin.dto';
import { RoutineCheckinStatus } from './routine-checkin-status.enum';

@Controller('routine-checkins')
export class RoutineCheckinsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() body: CreateRoutineCheckinDto) {
    const routine = await this.prisma.routine.findUnique({ where: { id: body.routineId } });
    if (!routine) {
      throw new BadRequestException('Routine not found.');
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

    return {
      checkin,
      pet: {
        name: updatedPet.name,
        mood: updatedPet.mood,
        happiness: updatedPet.happiness,
      },
      message,
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
      default:
        return { mood: 'normal', delta: -1, message: 'Okay, postponed for later.' };
    }
  }
}
