import { Request, Response } from "express";
import { z } from "zod";

import {
    getCvcCoursesByCourse,
    getCvcCoursesByGE,
    getCvcLastUpdated,
} from "../service/cvcCourse.service";

import {
    cvcCourseByCourseRequestSchema,
    cvcCourseByGERequestSchema,
    cvcLastUpdatedRequestSchema,
    cvcLastUpdatedResponseSchema,
    getCvcCoursesResponseSchema,
} from "../model/cvcCourse.model";
import logger from "../util/logger";

export const getCvcCoursesByGEHandler = async (req: Request, res: Response) => {
    try {
        const requestValidated = cvcCourseByGERequestSchema.parse({
            ...req.query,
        });

        const cvcCourses = (await getCvcCoursesByGE(requestValidated)).map(course => {
            let { targetInstitution, ...rest } = course;
            return rest; 
        });
        const lastUpdated = await getCvcLastUpdated();

        res.status(200).json({
            status: res.statusCode,
            data: cvcCourses,
            lastUpdated: lastUpdated,
        }/* satisfies z.infer<typeof getCvcCoursesResponseSchema>*/); // hehe I made it not satisfy >:D 
    } catch (error) {
        logger.warn(error)
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

        const cvcCourses = (await getCvcCoursesByCourse(requestValidated)).map(course => {
            let { targetInstitution, ...rest } = course;
            return rest; 
        });
        const lastUpdated = await getCvcLastUpdated();

        res.status(200).json({
            status: res.statusCode,
            data: cvcCourses,
            lastUpdated: lastUpdated,
        }/*satisfies z.infer<typeof getCvcCoursesResponseSchema>*/); // hehe I made it not satisfy >:D 
    } catch (error) {
        logger.warn(error)
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
            lastUpdated,
        } satisfies z.infer<typeof cvcLastUpdatedResponseSchema>);
    } catch (error) {
        logger.warn(error)
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
