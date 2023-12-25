import { seedInstitutions } from "./seed/institutions.seed";
import { seedCvc } from "./seed/cvc.seed";
import { seedArticulations } from "./seed/articulations.seed";
import logger from "../src/util/logger";

async function seed() {
    await seedInstitutions("./institutions/institutions.json");
    await seedCvc("./cvc/cvc.json");
    await seedArticulations();
}

seed()
    .catch((error) => {
        logger.fatal(error);
        process.exit(1);
    })
    .finally(() => {
        logger.info("Seeding complete");
    });
