import { Request, Response } from "express";
import { z } from "zod";
import { institutionRequestSchema } from "../model/institution.model";
import { getInstitutions } from "../service/institution.service";
import logger from "../util/logger";

export const getInstitutionsHandler = async (req: Request, res: Response) => {
    try {
        institutionRequestSchema.parse({
            ...req.query,
        });

        const cvcCourses = await getInstitutions();

        res.status(200).json({
            status: res.statusCode,
            data: cvcCourses,
        });
    } catch (error) {
        logger.warn(error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: res.statusCode,
                error: error,
            });
        }
        return res.status(400).json({
            status: res.statusCode,
            error: (error as Error).message,
        });
    }
};
