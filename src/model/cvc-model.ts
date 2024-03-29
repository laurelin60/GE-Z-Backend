import { z } from "zod";

export const geAndCount = z
    .object({
        category: z.string(),
        count: z.number(),
    })
    .strict();

export const cvcCourseByGERequestSchema = z
    .object({
        institution: z.string(),
        ge: z.string(),
        take: z.string().regex(/^\d+$/).transform(Number).optional(),
        skip: z.string().regex(/^\d+$/).transform(Number).optional(),
    })
    .strict();

export const cvcCourseByCourseRequestSchema = z
    .object({
        institution: z.string(),
        courseCode: z.string(),
        take: z.string().regex(/^\d+$/).transform(Number).optional(),
        skip: z.string().regex(/^\d+$/).transform(Number).optional(),
    })
    .strict();

export const cvcLastUpdatedRequestSchema = z.object({}).strict();

export const cvcCourseSchema = z
    .object({
        sendingInstitution: z.string(),
        courseCode: z.string(),
        courseName: z.string(),
        cvcId: z.string(),
        assistPath: z.string(),
        niceToHaves: z.array(z.string()),
        units: z.number(),
        tuition: z.number(),
        startDate: z.number(),
        endDate: z.number(),
        async: z.boolean(),
        hasOpenSeats: z.boolean(),
        hasPrereqs: z.boolean(),
        instantEnrollment: z.boolean(),
        fulfillsGEs: z.array(geAndCount),
        articulatesTo: z.array(z.string()),
    })
    .strict();

export const cvcLastUpdatedResponseSchema = z
    .object({
        status: z.number(),
        data: z.object({
            lastUpdated: z.number(),
        }),
    })
    .strict();

export const cvcCoursesResponseSchema = z
    .object({
        status: z.number(),
        data: z.array(cvcCourseSchema),
        lastUpdated: z.number(),
    })
    .strict();
