import fs from "fs";
import path from "path";

import { z } from "zod";

import logger from "../../src/util/logger";
import { xprisma } from "../../src/util/prisma.client";

const agreementSchema = z.object({
    assistPath: z.string(),
    articulations: z.array(
        z.object({
            from: z.array(z.string()),
            to: z.array(z.string()),
        }),
    ),
});

const assistSchema = z.object({
    academicYear: z.string(),
    targetInstitutions: z.array(
        z.object({
            targetInstitution: z.string(),
            sendingInstitutions: z.array(
                z.object({
                    sendingInstitution: z.string(),
                    agreements: z.array(agreementSchema),
                }),
            ),
        }),
    ),
});

export async function seedArticulations() {
    logger.info("Seeding Articulations");

    const institutions = await xprisma.institution.findMany();
    const institutionCodes: string[] = institutions.map(
        (institution) => institution.code,
    );

    const promises = institutionCodes.map(async (code) => {
        const articulationsData = fs.readFileSync(
            path.resolve(
                __dirname,
                `./institutions/${code}/${code}.assist.json`,
            ),
            "utf-8",
        );

        const assist = assistSchema.parse(JSON.parse(articulationsData));

        await Promise.all(
            assist.targetInstitutions.flatMap((targetInstitution) =>
                targetInstitution.sendingInstitutions.flatMap(
                    (sendingInstitution) =>
                        sendingInstitution.agreements.map((agreement) =>
                            seedAgreement(
                                agreement,
                                sendingInstitution.sendingInstitution,
                                targetInstitution.targetInstitution,
                            ),
                        ),
                ),
            ),
        );
    });

    await Promise.all(promises);

    const added = await xprisma.articulation.findMany();
    logger.info(`Seeded ${added.length} Articulations`);
}

function formatCode(inputString: string): string {
    return inputString.replace(/[^a-zA-Z0-9]/g, "");
}

async function seedAgreement(
    agreement: z.infer<typeof agreementSchema>,
    sendingInstitution: string,
    targetInstitution: string,
) {
    for (const articulation of agreement.articulations) {
        const fromCourses = await xprisma.cvcCourse.findMany({
            where: {
                courseCode: {
                    in: articulation.from.map(formatCode),
                },
                college: sendingInstitution,
            },
        });

        const toCourses = await xprisma.course.findMany({
            where: {
                courseCode: {
                    in: articulation.to,
                },
                institution: {
                    name: targetInstitution,
                },
            },
        });

        if (fromCourses.length > 0 && toCourses.length > 0) {
            if (fromCourses.length > 0 && toCourses.length > 0) {
                // Check if an articulation with the same 'from' and 'to' courses already exists
                const existingArticulation =
                    await xprisma.articulation.findFirst({
                        where: {
                            fromCollege: sendingInstitution,
                            toInstitutionId: toCourses[0].institutionId,
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
                                fromCollege: sendingInstitution,
                                toInstitution: {
                                    connect: {
                                        name: targetInstitution,
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

                    for (const fromCourse of createdArticulation.from) {
                        await xprisma.cvcCourse.update({
                            where: {
                                id: fromCourse.id,
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
