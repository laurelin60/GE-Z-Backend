import { Response } from "express";
import z from "zod";

import logger from "../../util/logger";

import QueryError from "./query-error";

export const handleError = (res: Response, error: unknown) => {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            status: res.statusCode,
            error: error,
        });
    }

    if (error instanceof QueryError) {
        return res.status(400).json({
            status: res.statusCode,
            error: (error as Error).message,
        });
    }

    logger.error(error);
    return res.status(500).json({
        status: res.statusCode,
        error: (error as Error).message,
    });
};
