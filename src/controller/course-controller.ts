import { Request, Response } from "express";
import { z } from "zod";

import {
    coursesByInstitutionRequestSchema,
    coursesByInstitutionResponseSchema,
} from "../model/course-model";
import { getCoursesByInstitution } from "../service/course-service";

import { handleError } from "./util/response-handler";

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
        handleError(res, error);
    }
};
