import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      { id: 'routine_001', name: 'Drink water', userId },
      { id: 'routine_002', name: 'Study English', userId },
      { id: 'routine_003', name: 'Read the Bible', userId },
      { id: 'routine_004', name: 'Workout', userId },
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
