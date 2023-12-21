import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function printEntireDatabase() {
    try {
        // Fetch all records from the 'geCourseList' table
        const allGeCourseLists = await prisma.geCourseList.findMany();
        console.log(allGeCourseLists)
    } 
    catch (error) {
        console.error('Error querying the database:', error);
    } 
    finally {
        // Close the Prisma client to end the connection
        await prisma.$disconnect();
    }
}

// Call the function to print the entire database
printEntireDatabase();