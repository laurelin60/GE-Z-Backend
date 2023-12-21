import { z } from "zod";

export const coursesByInstitutionRequestSchema = z
    .object({
        institution: z.string(),
    })
    .strict();

export const coursesByInstitutionResponseSchema = z
    .object({
        courseCode: z.string(),
        courseDepartment: z.string(),
        courseNumber: z.string(),
        courseName: z.string(),
        geCategories: z.array(z.string()),
    })
    .strict();
