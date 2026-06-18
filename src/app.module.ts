import { Module } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';
import { PetController } from './modules/pet/pet.controller';
import { PrismaService } from './prisma.service';
import { RoutineCheckinsController } from './modules/routine-checkins/routine-checkins.controller';
import { RoutinesController } from './modules/routines/routines.controller';

@Module({
  controllers: [
    HealthController,
    PetController,
    RoutineCheckinsController,
    RoutinesController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
