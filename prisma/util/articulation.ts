import { xprisma } from "../../src/util/prisma.client";

export type agreement = {
    assistPath: string;
    fromCollege: string;
    toInstitutionCode: string;
    articulations: articulation[];
};

export type articulation = {
    fromCvcCoursesCodes: string[];
    toCoursesCodes: string[];
};

export async function createManyArticulations(agreements: agreement[]) {
    for (const agreement of agreements) {
        for (const articulation of agreement.articulations) {
            const fromCourses = await getFromCourses(
                articulation,
                agreement.fromCollege,
            );
            const toCourses = await getToCourses(
                articulation,
                agreement.toInstitutionCode,
            );

            if (toCourses.length > 0) {
                const existingArticulation =
                    await xprisma.articulation.findFirst({
                        where: {
                            fromCollege: agreement.fromCollege,
                            toInstitution: {
                                code: agreement.toInstitutionCode,
                            },
                            from: {
                                every: {
                                    id: {
                                        in: fromCourses.map(
                                            (course) => course.id,
                                        ),
                                    },
                                },
                            },
                            to: {
                                every: {
                                    id: {
                                        in: toCourses.map(
                                            (course) => course.id,
                                        ),
                                    },
                                },
                            },
                        },
                    });

                if (!existingArticulation) {
                    const createdArticulation =
                        await xprisma.articulation.create({
                            data: {
                                fromCollege: agreement.fromCollege,
                                toInstitution: {
                                    connect: {
                                        code: agreement.toInstitutionCode,
                                    },
                                },
                                assistPath: agreement.assistPath,
                                from: {
                                    connect: fromCourses.map((course) => ({
                                        id: course.id,
                                    })),
                                },
                                to: {
                                    connect: toCourses.map((course) => ({
                                        id: course.id,
                                    })),
                                },
                            },
                            include: {
                                from: true,
                                to: {
                                    include: {
                                        geCategories: true,
                                    },
                                },
                            },
                        });

                    for (const fromCvcCourse of createdArticulation.from) {
                        await xprisma.cvcCourse.update({
                            where: {
                                id: fromCvcCourse.id,
                            },
                            data: {
                                fulfillsGEs: {
                                    connect: createdArticulation.to.flatMap(
                                        (toCourse) =>
                                            toCourse.geCategories.map(
                                                (geCategory) => ({
                                                    id: geCategory.id,
                                                }),
                                            ),
                                    ),
                                },
                            },
                        });
                    }
                }
            }
        }
    }
}

async function getFromCourses(articulation: articulation, fromCollege: string) {
    return xprisma.cvcCourse.findMany({
        where: {
            courseCode: {
                in: articulation.fromCvcCoursesCodes.map(formatCode),
            },
            college: fromCollege,
        },
    });
}

async function getToCourses(
    articulation: articulation,
    toInstitutionCode: string,
) {
    return xprisma.course.findMany({
        where: {
            courseCode: {
                in: articulation.toCoursesCodes,
            },
            institution: {
                code: toInstitutionCode,
            },
        },
    });
}

function formatCode(inputString: string): string {
    return inputString.replace(/[^a-zA-Z0-9]/g, "");
}
