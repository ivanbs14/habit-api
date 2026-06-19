import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  scheduledTime!: string;

  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @IsBoolean()
  isActive!: boolean;
}
