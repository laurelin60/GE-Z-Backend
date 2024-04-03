import logger from "../../../src/util/logger";

import seedArticulations from "./seed-articulations";

seedArticulations("./scrapers/assist-data.json").catch((error) => {
    logger.error(error);
    process.exit(1);
});
