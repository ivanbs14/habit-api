import { IsEnum, IsString } from 'class-validator';
import { RoutineCheckinStatus } from './routine-checkin-status.enum';

export class CreateRoutineCheckinDto {
  @IsString()
  routineId!: string;

  @IsEnum(RoutineCheckinStatus)
  status!: RoutineCheckinStatus;
}
