import { z } from "zod";

export const institutionRequestSchema = z.object({}).strict();

export const institutionSchema = z
    .object({
        name: z.string(),
        code: z.string(),
        geCategories: z.array(z.string()),
    })
    .strict();

export const institutionsResponseSchema = z
    .object({
        status: z.number(),
        data: z.array(institutionSchema),
    })
    .strict();
