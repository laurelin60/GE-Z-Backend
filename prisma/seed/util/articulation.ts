import { PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";

import formatCode from "./format-code";

export type agreement = {
    assistPath: string;
    fromCollege: string;
    toInstitutionName: string;
    articulations: articulation[];
};

export type articulation = {
    fromCvcCourseCodes: string[];
    toCourseCodes: string[];
};

export async function createManyArticulations(
    agreements: agreement[],
    prisma: Omit<PrismaClient, ITXClientDenyList> = xprisma,
) {
    await prisma.articulation.createMany({
        data: agreements.flatMap((agreement) =>
            agreement.articulations.map((articulation) => ({
                fromCollege: agreement.fromCollege,
                toInstitutionName: agreement.toInstitutionName,
                assistPath: agreement.assistPath,
                fromCoursesStrings:
                    articulation.fromCvcCourseCodes.map(formatCode),
                toCoursesStrings: articulation.toCourseCodes.map(formatCode),
            })),
        ),
        skipDuplicates: true,
    });

    await connectInstitutions(prisma);
    await connectCvcCourses(prisma);
    await connectCvcGes(prisma);
}

async function connectInstitutions(
    prisma: Omit<PrismaClient, ITXClientDenyList>,
) {
    const institutions = await prisma.institution.findMany();

    for (const [i, institution] of institutions.entries()) {
        logger.info(`Connecting articulations to ${institution.name}`);
        await prisma.articulation.updateMany({
            where: {
                toInstitutionName: institution.name,
            },
            data: {
                toInstitutionId: institution.id,
            },
        });

        const articulations = await prisma.articulation.findMany({
            where: {
                toInstitutionId: institution.id,
            },
        });

        for (const [j, articulation] of articulations.entries()) {
            if (j % 10 === 9) {
                process.stdout.write(
                    `\r[${i + 1}/${institutions.length}] [${j + 1}/${articulations.length}]`,
                );
            }
            const courses = await prisma.course.findMany({
                where: {
                    institutionId: institution.id,
                    courseCode: {
                        in: articulation.toCoursesStrings,
                    },
                },
            });

            await prisma.articulation.update({
                where: {
                    id: articulation.id,
                },
                data: {
                    to: {
                        connect: courses.map((course) => ({
                            id: course.id,
                        })),
                    },
                },
            });
        }

        process.stdout.write(`\r`);
    }
}

export async function connectCvcCourses(
    prisma: Omit<PrismaClient, ITXClientDenyList>,
) {
    logger.info("Connecting articulations to CVC courses");

    const articulations = await prisma.articulation.findMany();

    for (const [i, articulation] of articulations.entries()) {
        if (i % 10 === 9) {
            process.stdout.write(`\r[${i + 1}/${articulations.length}]`);
        }

        const fromCourses = await prisma.cvcCourse.findMany({
            where: {
                college: articulation.fromCollege,
                courseCode: {
                    in: articulation.fromCoursesStrings,
                },
            },
        });

        if (fromCourses.length < 1) {
            continue;
        }

        await prisma.articulation.update({
            where: {
                id: articulation.id,
            },
            data: {
                from: {
                    connect: fromCourses.map((course) => ({
                        id: course.id,
                    })),
                },
            },
        });
    }

    process.stdout.write(`\r`);
}

export async function connectCvcGes(
    prisma: Omit<PrismaClient, ITXClientDenyList>,
) {
    logger.info("Connecting CVC courses to GE fulfillments");

    const cvcCourses = await prisma.cvcCourse.findMany({
        include: {
            articulatesTo: {
                include: {
                    to: {
                        select: {
                            geCategories: true,
                        },
                    },
                },
            },
        },
    });

    for (const [i, cvcCourse] of cvcCourses.entries()) {
        if (i % 10 === 9) {
            process.stdout.write(`\r[${i + 1}/${cvcCourses.length}]`);
        }

        if (cvcCourse.articulatesTo.length < 1) {
            continue;
        }

        const geCategories = cvcCourse.articulatesTo.flatMap((articulation) =>
            articulation.to.flatMap((course) => course.geCategories),
        );

        if (geCategories.length < 1) {
            continue;
        }

        const fulfillsGEs = await Promise.all(
            geCategories.map((geCategory) => {
                return prisma.cvcFulillsGe.upsert({
                    where: {
                        cvcCourseId_geCategoryId: {
                            cvcCourseId: cvcCourse.id,
                            geCategoryId: geCategory.id,
                        },
                    },
                    create: {
                        cvcCourseId: cvcCourse.id,
                        geCategoryId: geCategory.id,
                    },
                    update: {
                        count: {
                            increment: 1,
                        },
                    },
                });
            }),
        );

        await prisma.cvcCourse.update({
            where: {
                id: cvcCourse.id,
            },
            data: {
                fulfillsGEs: {
                    connect: fulfillsGEs.map((fulfillsGE) => ({
                        id: fulfillsGE.id,
                    })),
                },
            },
        });
    }

    process.stdout.write(`\r`);
}
