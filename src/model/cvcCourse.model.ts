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
    })
    .strict();

export const cvcCourseByCourseRequestSchema = z
    .object({
        institution: z.string(),
        courseCode: z.string(),
    })
    .strict();

export const cvcCourseSchema = z
    .object({
        targetInstitution: z.string(), // Won't be returned in server response for now but keeping it just in case 
        sendingInstitution: z.string(),
        courseCode: z.string(),
        courseName: z.string(),
        cvcId: z.string(),
        assistPath: z.string(),
        niceToHaves: z.array(z.string()),
        units: z.number(),
        term: z.string(),
        startYear: z.number(),
        startMonth: z.number(),
        startDay: z.number(),
        endYear: z.number(),
        endMonth: z.number(),
        endDay: z.number(),
        tuition: z.number(),
        async: z.boolean(),
        hasOpenSeats: z.boolean(),
        hasPrereqs: z.boolean(),
        instantEnrollment: z.boolean(),
        fulfillsGEs: z.array(geAndCount),
        articulatesTo: z.array(z.string()),
    })
    .strict();

export const cvcLastUpdatedRequestSchema = z.object({}).strict();

export const cvcLastUpdatedResponseSchema = z
    .object({
        status: z.number(),
        lastUpdated: z.number(),
    })
    .strict();

export const getCvcCoursesResponseSchema = z
    .object({
        status: z.number(),
        data: z.array(cvcCourseSchema),
        lastUpdated: z.number(),
    })
    .strict();
