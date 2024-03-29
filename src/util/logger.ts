import pino from "pino";
import pretty from "pino-pretty";

const logger = pino(
    pretty({
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:HH:MM:ss",
    }),
);

export default logger;
