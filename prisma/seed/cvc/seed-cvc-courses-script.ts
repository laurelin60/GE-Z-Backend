import logger from "../../../src/util/logger";

import seedCvc from "./seed-cvc-courses";

seedCvc("./scrapers/cvc-courses.json").catch((error) => {
    logger.error(error);
    process.exit(1);
});
