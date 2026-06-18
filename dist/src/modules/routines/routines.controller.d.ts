import { PrismaService } from '../../prisma.service';
export declare class RoutinesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    current(): Promise<{
        routine: {
            id: string;
            name: string;
            isActive: boolean;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        message: string;
    }>;
}
