import { Request, Response } from "express";
import { z } from "zod";

import {
    cvcCourseByCourseRequestSchema,
    cvcCourseByGERequestSchema,
    cvcLastUpdatedRequestSchema,
    cvcLastUpdatedResponseSchema,
    cvcCoursesResponseSchema,
} from "../model/cvcCourse.model";
import {
    getCvcCoursesByCourse,
    getCvcCoursesByGE,
    getCvcLastUpdated,
} from "../service/cvcCourse.service";

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
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: res.statusCode,
                error: error,
            });
        }
        return res.status(400).json({
            test: "ass",
            status: res.statusCode,
            error: (error as Error).message,
        });
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

export const cvcLastUpdatedHandler = async (req: Request, res: Response) => {
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
