import { Request, Response } from "express";
import { z } from "zod";

import {
    cvcCourseByCourseRequestSchema,
    cvcCourseByGERequestSchema,
    cvcLastUpdatedRequestSchema,
    cvcLastUpdatedResponseSchema,
    cvcCoursesResponseSchema,
} from "../model/cvc-model";
import {
    getCvcCoursesByCourse,
    getCvcCoursesByGE,
    getCvcLastUpdated,
} from "../service/cvc-service";

import { handleError } from "./util/response-handler";

export const getCvcCoursesByGEHandler = async (req: Request, res: Response) => {
    try {
        const requestValidated = cvcCourseByGERequestSchema.parse({
            ...req.query,
        });

        const cvcCourses = await getCvcCoursesByGE(requestValidated);
        const lastUpdated = await getCvcLastUpdated();

        res.status(200).json({
            status: res.statusCode,
            data: cvcCourses,
            lastUpdated: lastUpdated,
        } satisfies z.infer<typeof cvcCoursesResponseSchema>);
    } catch (error) {
        handleError(res, error);
    }
};

export const getCvcCoursesByCourseHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const requestValidated = cvcCourseByCourseRequestSchema.parse({
            ...req.query,
        });

        const cvcCourses = await getCvcCoursesByCourse(requestValidated);
        const lastUpdated = await getCvcLastUpdated();

        res.status(200).json({
            status: res.statusCode,
            data: cvcCourses,
            lastUpdated: lastUpdated,
        } satisfies z.infer<typeof cvcCoursesResponseSchema>);
    } catch (error) {
        handleError(res, error);
    }
};

export const getCvcLastUpdatedHandler = async (req: Request, res: Response) => {
    try {
        cvcLastUpdatedRequestSchema.parse({
            ...req.query,
        });

        const lastUpdated = await getCvcLastUpdated();

        res.status(200).json({
            status: res.statusCode,
            data: {
                lastUpdated: lastUpdated,
            },
        } satisfies z.infer<typeof cvcLastUpdatedResponseSchema>);
    } catch (error) {
        handleError(res, error);
    }
};
