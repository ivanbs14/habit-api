import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Controller('pet')
export class PetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('status')
  async status() {
    const pet = await this.prisma.pet.findFirst({ where: { userId: 'user_fixed_001' } });
    return { pet };
  }
}
