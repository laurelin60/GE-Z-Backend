import { z } from "zod";

export const institutionRequestSchema = z.object({}).strict();

export const institutionResponseSchema = z
    .object({
        name: z.string(),
        code: z.string(),
        geCategories: z.array(z.string()),
    })
    .strict();
