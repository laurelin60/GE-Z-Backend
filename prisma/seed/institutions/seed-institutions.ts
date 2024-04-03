import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";
import { createManyInstitutions, institutionType } from "../util/institution";

import Uci from "./uci";
import Ucla from "./ucla";
import Ucsb from "./ucsb";

export default async function seedInstitutions() {
    logger.info("Fetching institution courses");

    const institutionClasses = [Uci, Ucla, Ucsb];

    const institutions: institutionType[] = await Promise.all(
        institutionClasses.map(async (institutionClass) => {
            const institution = await new institutionClass().getInstitution();
            logger.info(
                `Found ${institution.courses.length} courses for ${institution.code}`,
            );
            return institution;
        }),
    );

    logger.info("Seeding institutions");

    await xprisma.institution.deleteMany();
    await createManyInstitutions(institutions);

    logger.info(
        "Seeded institutions: " +
            institutions.map((institution) => institution.code).join(", "),
    );
}
