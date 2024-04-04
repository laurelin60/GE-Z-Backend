import fs from "fs/promises";
import https from "https";

import cors from "cors";
import express from "express";

import routes from "./routes";
import logger from "./util/logger";

import { spawn, ChildProcess, exec } from 'child_process';

require("dotenv").config();

export const app = express();
const PORT =
    process.env.NODE_ENV === "test" ? process.env.TEST_PORT : process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

async function main() {
    if (process.argv.includes("-ssl")) {
        https
            .createServer(
                {
                    key: await fs.readFile("ssl/private.key"),
                    cert: await fs.readFile("ssl/certificate.crt"),
                },
                app,
            )
            .listen(PORT);
        logger.info(
            `Server is running on https://localhost:${PORT}/api/docs with SSL`,
        );
    } else {
        app.listen(PORT, () => {
            logger.info(
                `Server is running on http://localhost:${PORT}/api/docs`,
            );
        });
    }

    logger.info(`environment: ${process.env.NODE_ENV}`);
}
// start scheduled cvc scraper
// tsx 
let childProcess: ChildProcess | null = null;

function startScheduledScraper() {
    // Ensure only one instance of the script is running
    if (childProcess) {
        childProcess.kill();
        childProcess = null;
    }

    // Start the script with 'ts-node', adjust command as necessary for your environment
    childProcess = spawn('tsx', ['prisma/seed/util/schedule/schedule-run.ts'], { shell: true, stdio: 'inherit' });

    // Listen for unexpected exit (crash)
    childProcess.on('exit', (code, signal) => {
        console.log(`Child scheduled scraper process exited with code ${code} and signal ${signal}, restarting`);
        // Restart the script if it crashes
        startScheduledScraper();
    });
}

main();
startScheduledScraper();