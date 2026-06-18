import { PrismaService } from '../../prisma.service';
import { CreateRoutineCheckinDto } from './create-routine-checkin.dto';
import { DeviceStateService } from '../device/device-state.service';
export declare class RoutineCheckinsController {
    private readonly prisma;
    private readonly deviceStateService;
    constructor(prisma: PrismaService, deviceStateService: DeviceStateService);
    create(body: CreateRoutineCheckinDto): Promise<{
        checkin: {
            id: string;
            userId: string;
            createdAt: Date;
            routineId: string;
            status: string;
        };
        pet: {
            id: string;
            name: string;
            mood: string;
            happiness: number;
            userId: string;
            createdAt: string;
            updatedAt: string;
        };
        message: string;
        dueNow: boolean;
        routine: {
            id: string;
            name: string;
            description: string;
            question: string;
            scheduledTime: string;
            frequency: string;
            isActive: boolean;
        } | null;
        nextCheckAt: string | null;
        nextPollInSeconds: number | null;
    }>;
    private resolveMoodRule;
}
