import { Module } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';
import { DeviceController } from './modules/device/device.controller';
import { DeviceStateService } from './modules/device/device-state.service';
import { PetController } from './modules/pet/pet.controller';
import { PrismaService } from './prisma.service';
import { RoutineCheckinsController } from './modules/routine-checkins/routine-checkins.controller';
import { RoutinesController } from './modules/routines/routines.controller';

@Module({
  controllers: [
    DeviceController,
    HealthController,
    PetController,
    RoutineCheckinsController,
    RoutinesController,
  ],
  providers: [DeviceStateService, PrismaService],
})
export class AppModule {}
