"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userId = 'user_fixed_001';
    const petId = 'pet_001';
    await prisma.routineCheckin.deleteMany();
    await prisma.petEvent.deleteMany();
    await prisma.routine.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
        data: {
            id: userId,
            name: 'HabitPet User',
        },
    });
    await prisma.pet.create({
        data: {
            id: petId,
            name: 'HabitPet',
            mood: 'normal',
            happiness: 70,
            userId,
        },
    });
    await prisma.routine.createMany({
        data: [
            {
                id: 'routine_001',
                name: 'Drink water',
                description: 'Remember to drink water',
                question: 'Did you drink water?',
                scheduledTime: '08:00',
                frequency: 'daily',
                userId,
            },
            {
                id: 'routine_002',
                name: 'Study English',
                description: 'Practice English',
                question: 'Did you study English today?',
                scheduledTime: '20:00',
                frequency: 'daily',
                userId,
            },
            {
                id: 'routine_003',
                name: 'Read the Bible',
                description: 'Bible reading time',
                question: 'Did you read the Bible today?',
                scheduledTime: '21:00',
                frequency: 'daily',
                userId,
            },
            {
                id: 'routine_004',
                name: 'Workout',
                description: 'Training routine',
                question: 'Did you train today?',
                scheduledTime: '18:00',
                frequency: 'daily',
                userId,
            },
        ],
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map