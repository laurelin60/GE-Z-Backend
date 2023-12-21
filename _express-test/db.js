import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function writeGeCourses(prismaJSON) {
    // If this function errors saying missing "where" parameter than the prismaJSON passed in is probably wrong (try logging geCategory and institution) 
    const geCategory = prismaJSON.data.geCategory;
    const institution = prismaJSON.data.institution;
    try {
        // Find and delete existing GECourseList
        const existingGeCourseList = await prisma.geCourseList.findUnique({
            where: {
                unique_geCategory_institution: {
                    geCategory,
                    institution
                }
            },
            include: {
                courses: true
            }
        });

        if (existingGeCourseList) {
            // Delete related cvcCourses first
            const deleteCvcCourses = existingGeCourseList.courses.map(async (course) => {
                await prisma.cvcCourse.delete({
                    where: {
                        id: course.id,
                    }
                });
            });

            await Promise.all(deleteCvcCourses);

            // Delete the existing geCourseList
            await prisma.geCourseList.delete({
                where: {
                    unique_geCategory_institution: {
                        geCategory,
                        institution
                    }
                }
            });
        }

        // Create a new GECourseList with new data
        const newGeCourseList = await prisma.geCourseList.create(prismaJSON);
    }
    catch (error) {
        console.error(`Error writing GE category classes (institution: "${institution}" category: "${geCategory}"):`, error);
    }
    finally {
        // Close the Prisma client to end the connection
        await prisma.$disconnect();
    }
}