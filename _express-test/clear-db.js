import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        await prisma.$executeRaw`TRUNCATE "cvcCourses", "geCourseLists" RESTART IDENTITY CASCADE`;
        console.log('Database cleared successfully');
    }
    catch (error) {
        console.error('Error clearing database:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}

clearDatabase();