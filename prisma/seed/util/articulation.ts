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

export async function createManyArticulations(agreements: agreement[]) {
    await xprisma.articulation.createMany({
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

    await connectInstitutions();
    await connectCvcCourses();
    await connectCvcGes();
}

async function connectInstitutions() {
    const institutions = await xprisma.institution.findMany();

    for (const institution of institutions) {
        logger.info(`Connecting articulations to ${institution.name}`);
        await xprisma.articulation.updateMany({
            where: {
                toInstitutionName: institution.name,
            },
            data: {
                toInstitutionId: institution.id,
            },
        });

        const articulations = await xprisma.articulation.findMany({
            where: {
                toInstitutionId: institution.id,
            },
        });

        for (const [i, articulation] of articulations.entries()) {
            if (i % 10 === 9) {
                process.stdout.write(`\r[${i + 1}/${articulations.length}]`);
            }
            const courses = await xprisma.course.findMany({
                where: {
                    institutionId: institution.id,
                    courseCode: {
                        in: articulation.toCoursesStrings,
                    },
                },
            });

            await xprisma.articulation.update({
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

async function connectCvcCourses() {
    logger.info("Connecting articulations to CVC courses");

    const articulations = await xprisma.articulation.findMany();

    for (const [i, articulation] of articulations.entries()) {
        if (i % 10 === 9) {
            process.stdout.write(`\r[${i + 1}/${articulations.length}]`);
        }

        const fromCourses = await xprisma.cvcCourse.findMany({
            where: {
                college: articulation.fromCollege,
                courseCode: {
                    in: articulation.fromCoursesStrings,
                },
            },
        });

        await xprisma.articulation.update({
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

async function connectCvcGes() {
    logger.info("Connecting CVC courses to GE categories");

    const cvcCourses = await xprisma.cvcCourse.findMany({
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

        await xprisma.cvcCourse.update({
            where: {
                id: cvcCourse.id,
            },
            data: {
                fulfillsGEs: {
                    connect: geCategories.map((geCategory) => ({
                        id: geCategory.id,
                    })),
                },
            },
        });
    }

    process.stdout.write(`\r`);
}