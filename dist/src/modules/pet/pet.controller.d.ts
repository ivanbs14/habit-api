import { PrismaService } from '../../prisma.service';
export declare class PetController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    status(): Promise<{
        pet: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            mood: string;
            happiness: number;
        } | null;
    }>;
}
