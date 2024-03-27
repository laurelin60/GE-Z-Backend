import { Request, Response } from "express";
import { z } from "zod";

import {
    institutionRequestSchema,
    institutionsResponseSchema,
} from "../model/institution-model";
import { getInstitutions } from "../service/institution-service";

import { handleError } from "./util/response-handler";

export const getInstitutionsHandler = async (req: Request, res: Response) => {
    try {
        institutionRequestSchema.parse({
            ...req.query,
        });

        const institutions = await getInstitutions();

        res.status(200).json({
            status: res.statusCode,
            data: institutions,
        } satisfies z.infer<typeof institutionsResponseSchema>);
    } catch (error) {
        handleError(res, error);
    }
};
