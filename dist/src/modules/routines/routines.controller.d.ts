import { DeviceStateService } from '../device/device-state.service';
import { PrismaService } from '../../prisma.service';
import { CreateRoutineDto } from './create-routine.dto';
export declare class RoutinesController {
    private readonly prisma;
    private readonly deviceStateService;
    constructor(prisma: PrismaService, deviceStateService: DeviceStateService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string;
        question: string;
        scheduledTime: string;
        frequency: string;
        isActive: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(body: CreateRoutineDto): Promise<{
        routine: {
            id: string;
            name: string;
            description: string;
            question: string;
            scheduledTime: string;
            frequency: string;
            isActive: boolean;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    current(): Promise<{
        routine: {
            id: string;
            name: string;
            description: string;
            question: string;
            scheduledTime: string;
            frequency: string;
            isActive: boolean;
        } | null;
        message: string;
    }>;
}
