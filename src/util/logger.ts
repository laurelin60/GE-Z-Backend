import pino from "pino";
import pretty from "pino-pretty";

const logger = pino(
    pretty({
        translateTime: "SYS:standard",
    }),
);

export default logger;
