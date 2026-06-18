import { PrismaService } from '../../prisma.service';
export declare class PetController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    status(): Promise<{
        pet: {
            id: string;
            name: string;
            mood: string;
            happiness: number;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
}
