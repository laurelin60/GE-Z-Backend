import { Request, Response } from "express";
import { z } from "zod";

import {
    coursesByInstitutionRequestSchema,
    coursesByInstitutionResponseSchema,
} from "../model/course-model";
import { getCoursesByInstitution } from "../service/course-service";

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
        } satisfies z.infer<typeof coursesByInstitutionResponseSchema>);
    } catch (error) {
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
