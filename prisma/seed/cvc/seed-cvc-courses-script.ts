import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";

import seedCvc from "./seed-cvc-courses";

seedCvc("./scrapers/cvc-courses.json", xprisma).catch((error) => {
    logger.error(error);
    process.exit(1);
});
