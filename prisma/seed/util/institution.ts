import { xprisma } from "../../../src/util/prisma-client";

export type course = {
    courseCode: string;
    courseName: string;
    courseNumber: string;
    courseDepartment: string;
    geCategories: string[];
};

export type institution = {
    name: string;
    code: string;
    geCategories: string[];
    courses: course[];
};

export async function createManyInstitutions(institutions: institution[]) {
    for (const [i, institution] of institutions.entries()) {
        process.stdout.write(`\r[${i + 1}/${institutions.length}]`);
        const createdInstitution = await xprisma.institution.create({
            data: {
                name: institution.name,
                code: institution.code,
                geCategories: {
                    create: institution.geCategories.map((category) => ({
                        category,
                    })),
                },
            },
            include: {
                geCategories: true,
            },
        });

        await xprisma.course.createMany({
            data: institution.courses.map((course) => ({
                courseCode: course.courseCode,
                courseName: course.courseName,
                courseNumber: course.courseNumber,
                courseDepartment: course.courseDepartment,
                institutionId: createdInstitution.id,
            })),
            skipDuplicates: true,
        });

        for (const [j, course] of institution.courses.entries()) {
            if (j % 10 === 9) {
                process.stdout.write(
                    `\r[${i + 1}/${institutions.length}] [${j + 1}/${institution.courses.length}]`,
                );
            }

            if (course.geCategories.length < 1) {
                continue;
            }

            await xprisma.course.update({
                where: {
                    institutionId_courseCode: {
                        institutionId: createdInstitution.id,
                        courseCode: course.courseCode,
                    },
                },
                data: {
                    geCategories: {
                        connect: course.geCategories.map((category) => ({
                            institutionId_category: {
                                institutionId: createdInstitution.id,
                                category: category,
                            },
                        })),
                    },
                },
            });
        }
    }

    process.stdout.write(`\r`);
}
