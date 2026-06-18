import { PrismaService } from '../../prisma.service';
import { CreateRoutineCheckinDto } from './create-routine-checkin.dto';
export declare class RoutineCheckinsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(body: CreateRoutineCheckinDto): Promise<{
        checkin: {
            status: string;
            id: string;
            userId: string;
            createdAt: Date;
            routineId: string;
        };
        pet: {
            name: string;
            mood: string;
            happiness: number;
        };
        message: string;
    }>;
    private resolveMoodRule;
}
