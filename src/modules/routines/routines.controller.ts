import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { DeviceStateService } from '../device/device-state.service';
import { PrismaService } from '../../prisma.service';
import { CreateRoutineDto } from './create-routine.dto';

@Controller('routines')
export class RoutinesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceStateService: DeviceStateService,
  ) {}

  @Get()
  async findAll() {
    return this.prisma.routine.findMany({
      where: { userId: 'user_fixed_001' },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Post()
  async create(@Body() body: CreateRoutineDto) {
    const routine = await this.prisma.routine.create({
      data: {
        name: body.name,
        description: body.description,
        question: body.question,
        scheduledTime: body.scheduledTime,
        frequency: body.frequency,
        isActive: body.isActive,
        userId: 'user_fixed_001',
      },
    });

    return {
      routine,
      message: 'Routine created.',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const routine = await this.prisma.routine.findFirst({
      where: {
        id,
        userId: 'user_fixed_001',
      },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found.');
    }

    await this.prisma.$transaction([
      this.prisma.routineCheckin.deleteMany({
        where: { routineId: routine.id },
      }),
      this.prisma.routine.delete({
        where: { id: routine.id },
      }),
    ]);

    return {
      deletedRoutineId: routine.id,
      message: 'Routine deleted.',
    };
  }

  @Get('current')
  async current() {
    const startedAt = Date.now();
    console.log('[routines] GET /routines/current enter');
    const routine = await this.deviceStateService.getCurrentDueRoutine();

    console.log(
      `[routines] GET /routines/current exit found=${Boolean(routine)} ${Date.now() - startedAt}ms`,
    );

    return {
      routine,
      message: routine ? 'Current routine loaded.' : 'No routine available.',
    };
  }
}
