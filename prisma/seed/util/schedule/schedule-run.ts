import fs from "fs";

import fetchCvcData from "../../../../scrapers/cvc-scraper.mjs";
import logger from "../../../../src/util/logger";
import seedCvc from "../../institutions/seed-institutions";
import { connectCvcCourses, connectCvcGes } from "../articulation";

async function runSchedule() {
    // noinspection InfiniteLoopJS
    while (true) {
        if (isScheduled()) {
            logger.info("Running schedule");

            logger.info("Scraping CVC courses");
            await fetchCvcData();

            await seedCvc();
            await connectCvcCourses();
            await connectCvcGes();

            fs.appendFileSync(
                "./prisma/seed/util/schedule/schedule.log",
                "\n" + new Date().toString(),
            );

            logger.info("Schedule complete");
        } else {
            logger.info("Skipping schedule");
        }

        // sleep 1 minute
        await new Promise((resolve) => setTimeout(resolve, 60000));
    }
}

/**
 * Read the schedule.log file and check the DateTime of the last line
 * If more than 12 hours have passed, return true
 */
function isScheduled() {
    const logContent = fs.readFileSync(
        "./prisma/seed/util/schedule/schedule.log",
        "utf8",
    );
    const lines = logContent.trim().split("\n");

    if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const lastLineDateTime = new Date(lastLine);
        const currentDateTime = new Date();

        const hoursDifference =
            (currentDateTime.getTime() - lastLineDateTime.getTime()) /
            1000 /
            60 /
            60;

        if (hoursDifference < 12) {
            return false;
        }
    }

    return true;
}

runSchedule().catch((error) => {
    console.error(error);
    process.exit(1);
});
