import { z } from "zod";

import { institutionSchema } from "../model/institution-model";
import { xprisma } from "../util/prisma-client";

export const getInstitutions = async (): Promise<
    z.infer<typeof institutionSchema>[]
> => {
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
        } satisfies z.infer<typeof institutionSchema>;
    });
};
