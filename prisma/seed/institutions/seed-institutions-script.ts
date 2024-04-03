import logger from "../../../src/util/logger";

import seedInstitutions from "./seed-institutions";

seedInstitutions().catch((error) => {
    logger.error(error);
    process.exit(1);
});
