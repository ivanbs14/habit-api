import { Body, Controller, Get, Post } from '@nestjs/common';
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
