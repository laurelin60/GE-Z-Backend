import { z } from "zod";

export const coursesByInstitutionRequestSchema = z
    .object({
        institution: z.string(),
        take: z.string().regex(/^\d+$/).transform(Number).optional(),
        skip: z.string().regex(/^\d+$/).transform(Number).optional(),
    })
    .strict();

export const courseSchema = z
    .object({
        courseCode: z.string(),
        courseDepartment: z.string(),
        courseNumber: z.string(),
        courseName: z.string(),
        geCategories: z.array(z.string()),
    })
    .strict();

export const coursesByInstitutionResponseSchema = z
    .object({
        status: z.number(),
        data: z.array(courseSchema),
    })
    .strict();
