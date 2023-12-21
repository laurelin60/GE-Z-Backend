import { xprisma } from "../util/prisma.client";
import { z } from "zod";
import { institutionResponseSchema } from "../model/institution.model";

export const getInstitutions = async () => {
    const institutionsResult = await xprisma.institution.findMany({
        include: {
            geCategories: true,
        },
    });

    return institutionsResult.map((institution) => {
        return {
            name: institution.name,
            code: institution.code,
            geCategories: institution.geCategories.map(
                (geCategory) => geCategory.category,
            ),
        } satisfies z.infer<typeof institutionResponseSchema>;
    });
};
