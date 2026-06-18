import { Controller, Get } from '@nestjs/common';
import { DeviceStateService } from '../device/device-state.service';
import { PrismaService } from '../../prisma.service';

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
