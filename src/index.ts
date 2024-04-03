import cors from "cors";
import express from "express";
import https from "https";
import fs from 'fs/promises';

import routes from "./routes";
import logger from "./util/logger";

require("dotenv").config();

export const app = express();
const PORT =
    process.env.NODE_ENV === "test" ? process.env.TEST_PORT : process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

async function  main() {
    if (process.argv.includes('-ssl')) {
        https.createServer({
            key: await fs.readFile('ssl/private.key'),
            cert: await fs.readFile('ssl/certificate.crt')
        }, app).listen(PORT);
        logger.info(`Server is running on http://localhost:${PORT}/api/docs with SSL`);
    }
    else {
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}/api/docs`);
        });
    }

    logger.info(`environment: ${process.env.NODE_ENV}`);
}

main();