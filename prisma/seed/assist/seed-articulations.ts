import fs from "fs";

import z from "zod";

import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";
import { agreement, createManyArticulations } from "../util/articulation";

const agreementSchema = z.object({
    assistPath: z.string(),
    articulations: z.array(
        z
            .object({
                to: z.array(z.string()),
                from: z.array(z.string()),
            })
            .transform((articulation) => {
                return {
                    fromCvcCourseCodes: articulation.from,
                    toCourseCodes: articulation.to,
                };
            }),
    ),
});

const assistDataSchema = z.object({
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

async function seedArticulations(filepath: string) {
    const assistData = assistDataSchema.parse(
        JSON.parse(fs.readFileSync(filepath, "utf-8")),
    );

    logger.info("Seeding articulations from " + filepath);

    const agreements: agreement[] = [];

    for (const targetInstitution of assistData.targetInstitutions) {
        const toInstitutionName = targetInstitution.targetInstitution;
        for (const sendingInstitution of targetInstitution.sendingInstitutions) {
            const fromCollege = sendingInstitution.sendingInstitution;
            const agreement = sendingInstitution.agreements[0];

            if (!agreement) {
                continue;
            }

            const assistPath = agreement.assistPath;
            const articulations = agreement.articulations;

            agreements.push({
                assistPath,
                fromCollege,
                toInstitutionName,
                articulations,
            });
        }
    }

    await xprisma.articulation.deleteMany();
    await createManyArticulations(agreements);

    logger.info(
        `Seeded ${agreements.flatMap((a) => a.articulations).length} articulations`,
    );
}

seedArticulations("./scrapers/assist-data.json").catch((error) => {
    logger.error(error);
    process.exit(1);
});
