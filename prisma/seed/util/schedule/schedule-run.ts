import fs from "fs";

import fetchCvcData from "../../../../scrapers/cvc-scraper.mjs";
import logger from "../../../../src/util/logger";
import { xprisma } from "../../../../src/util/prisma-client";
import seedCvc from "../../cvc/seed-cvc-courses";
import { connectCvcCourses, connectCvcGes } from "../articulation";

async function runSchedule() {
    // noinspection InfiniteLoopJS
    while (true) {
        if (isScheduled()) {
            logger.info("Running schedule");

            logger.info("Scraping CVC courses");
            await fetchCvcData();

            try {
                await xprisma.$transaction(
                    async (prisma) => {
                        await seedCvc("./scrapers/cvc-courses.json", prisma);
                        await connectCvcCourses(prisma);
                        await connectCvcGes(prisma);
                    },
                    {
                        // 20 minutes
                        timeout: 1_200_000,
                    },
                );
                logger.info("Schedule complete");
            } catch (error) {
                console.log("\r");
                fs.appendFileSync(
                    "./prisma/seed/util/schedule/schedule.log",
                    "\nERROR",
                );
                logger.error("Error seeding CVC courses");
                logger.error(error);
            }

            fs.appendFileSync(
                "./prisma/seed/util/schedule/schedule.log",
                "\n" + new Date().toString(),
            );
        } else {
            logger.info(
                `Skipping schedule, running next in ${timeTillNextSchedule().toFixed(2)} hours`,
            );
        }

        // sleep 5 minutes
        await new Promise((resolve) => setTimeout(resolve, 300_000));
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

function timeTillNextSchedule() {
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

        return 12 - hoursDifference;
    }

    return 0;
}

runSchedule().catch((error) => {
    console.error(error);
    process.exit(1);
});
