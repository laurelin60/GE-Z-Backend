import { Response } from "express";
import z from "zod";

import logger from "../../util/logger";

export const handleError = (res: Response, error: unknown) => {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            status: res.statusCode,
            error: error,
        });
    }
    logger.error(error);
    return res.status(500).json({
        status: res.statusCode,
        error: (error as Error).message,
    });
};
