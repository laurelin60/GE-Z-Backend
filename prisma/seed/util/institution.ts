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
    for (const institution of institutions) {
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

        const geIds: Record<string, number> = {};
        createdInstitution.geCategories.forEach((category) => {
            geIds[category.category] = category.id;
        });

        for (const course of institution.courses) {
            await xprisma.course.create({
                data: {
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    courseNumber: course.courseNumber,
                    courseDepartment: course.courseDepartment,
                    institutionId: createdInstitution.id,
                    geCategories: {
                        connect: course.geCategories.map((category) => ({
                            id: geIds[category],
                        })),
                    },
                },
            });
        }
    }
}
