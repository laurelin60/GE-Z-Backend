import { Request, Response } from "express";
import { coursesByInstitutionRequestSchema } from "../model/course.model";
import { getCoursesByInstitution } from "../service/course.service";
import { z } from "zod";
import logger from "../util/logger";

export const getCoursesByInstitutionHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const requestValidated = coursesByInstitutionRequestSchema.parse({
            ...req.query,
        });

        const institutionCourses =
            await getCoursesByInstitution(requestValidated);

        res.status(200).json({
            status: res.statusCode,
            data: institutionCourses,
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
