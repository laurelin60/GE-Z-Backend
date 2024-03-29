import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";
import { createManyInstitutions, institution } from "../util/institution";

import getUciInstitution from "./uci";
import getUclaInstitution from "./ucla";
import getUcsbInstitution from "./ucsb";

async function seedInstitutions() {
    logger.info("Fetching institutions");

    const uci = await getUciInstitution();
    const ucla = await getUclaInstitution();
    const ucsb = await getUcsbInstitution();

    const institutions = [uci, ucla, ucsb] satisfies institution[];

    logger.info("Seeding institutions");

    await xprisma.institution.deleteMany();
    await createManyInstitutions(institutions);

    logger.info(
        "Seeded institutions: " +
            institutions.map((institution) => institution.code).join(", "),
    );
}

seedInstitutions().catch((error) => {
    logger.error(error);
    process.exit(1);
});
