// THIS FILE IS JUST FOR ADDING TESTING DATA
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedData() {
    try {
        const geCategory = "TEST_GE_CATEGORY";
        const institution = "Test Institution";

        // Find and delete existing GECourseList
        const existingGeCourseList = await prisma.geCourseList.findUnique({
            where: {
                unique_geCategory_institution: {
                    geCategory,
                    institution,
                },
            },
            include: {
                courses: true,
            },
        });

        if (existingGeCourseList) {
            // Delete related cvcCourses first
            const deleteCvcCourses = existingGeCourseList.courses.map(
                async (course) => {
                    await prisma.cvcCourse.delete({
                        where: {},
                    });
                },
            );

            await Promise.all(deleteCvcCourses);

            // Delete the existing geCourseList
            await prisma.geCourseList.delete({
                where: {
                    unique_geCategory_institution: {
                        geCategory,
                        institution,
                    },
                },
            });
        }

        // Create a new GECourseList with dummy data so we can do epic testing
        const newGeCourseList = await prisma.geCourseList.create({
            data: {
                geCategory,
                institution,
                courses: {
                    create: [
                        {
                            targetInstitution: institution,
                            sendingInstitution: "Test Sending Institution",
                            courseCode: "HLTH25",
                            courseName: "Sample Course Ia1",
                            cvcId: "1",
                            units: 3,
                            term: "Jan 1 - Mar 1",
                            startMonth: 1,
                            startDay: 2,
                            endMonth: 3,
                            endDay: 4,
                            tuition: 500,
                            async: false,
                            hasOpenSeats: true,
                            hasPrereqs: false,
                            instantEnrollment: true,
                            assistPath: "/TESTING_PATH",
                            articulatesTo: ["TEST_Course_A", "TEST_Course_B"],
                            fulfillsGEs: [geCategory],
                        },
                    ],
                },
            },
        });

        console.log("Dummy data inserted/updated successfully");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        // Close the Prisma client to end the connection
        await prisma.$disconnect();
    }
}

seedData();
