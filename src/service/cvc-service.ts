import { Prisma } from "@prisma/client";
import { uniqBy } from "lodash";
import { z } from "zod";

import QueryError from "../controller/util/query-error";
import {
    cvcCourseByCourseRequestSchema,
    cvcCourseByGERequestSchema,
    cvcCourseSchema,
} from "../model/cvc-model";
import logger from "../util/logger";
import { xprisma } from "../util/prisma-client";

function cvcQueryToResponse(
    cvcCourse: Prisma.CvcCourseGetPayload<{
        include: {
            fulfillsGEs: {
                include: {
                    geCategory: true;
                };
            };
            articulatesTo: { include: { to: true; toInstitution: true } };
        };
    }>,
) {
    return {
        sendingInstitution: cvcCourse.college,
        courseCode: cvcCourse.courseCode,
        courseName: cvcCourse.courseName,
        cvcId: cvcCourse.cvcId,
        assistPath: cvcCourse.articulatesTo[0].assistPath,
        niceToHaves: cvcCourse.niceToHaves,
        units: cvcCourse.units,
        tuition: cvcCourse.tuition,
        startDate: cvcCourse.startDate.getTime(),
        endDate: cvcCourse.endDate.getTime(),
        async: cvcCourse.async,
        hasOpenSeats: cvcCourse.hasOpenSeats,
        hasPrereqs: cvcCourse.hasPrereqs,
        instantEnrollment: cvcCourse.instantEnrollment,
        fulfillsGEs: cvcCourse.fulfillsGEs.map((fulfillsGe) => ({
            count: fulfillsGe.count,
            category: fulfillsGe.geCategory.category,
        })),
        articulatesTo: uniqBy(
            cvcCourse.articulatesTo.flatMap((articulation) => articulation.to),
            "id",
        ).flatMap((to) => to.courseDepartment + " " + to.courseNumber),
    } satisfies z.infer<typeof cvcCourseSchema>;
}

export const getCvcCoursesByGE = async (
    request: z.infer<typeof cvcCourseByGERequestSchema>,
) => {
    const institution = await xprisma.institution.findFirst({
        where: {
            OR: [{ name: request.institution }, { code: request.institution }],
        },
    });

    if (!institution) {
        throw new QueryError(`Institution '${request.institution}' not found`);
    }

    const geCategory = await xprisma.geCategory.findFirst({
        where: {
            institution: {
                id: institution.id,
            },
            category: request.ge,
        },
    });

    if (!geCategory) {
        throw new QueryError(
            `Category '${request.ge}' not found for institution '${request.institution}'`,
        );
    }

    const cvcCourses = await xprisma.cvcCourse.findMany({
        take: request.take,
        skip: request.skip,
        where: {
            fulfillsGEs: {
                some: {
                    geCategory: {
                        id: geCategory.id,
                    },
                },
            },
        },
        include: {
            fulfillsGEs: {
                include: {
                    geCategory: true,
                },
                where: {
                    geCategory: {
                        institution: {
                            id: institution.id,
                        },
                    },
                },
            },
            articulatesTo: {
                where: {
                    toInstitution: {
                        id: institution.id,
                    },
                },
                include: {
                    to: true,
                    toInstitution: true,
                },
            },
        },
    });
    return cvcCourses.map(cvcQueryToResponse);
};

export const getCvcCoursesByCourse = async (
    request: z.infer<typeof cvcCourseByCourseRequestSchema>,
) => {
    const institution = await xprisma.institution.findFirst({
        where: {
            OR: [{ name: request.institution }, { code: request.institution }],
        },
    });

    if (!institution) {
        throw new QueryError(`Institution '${request.institution}' not found`);
    }

    const course = await xprisma.course.findFirst({
        where: {
            courseCode: request.courseCode,
            institution: {
                id: institution.id,
            },
        },
    });

    if (!course) {
        throw new QueryError(
            `Course '${request.courseCode}' not found for institution '${request.institution}'`,
        );
    }

    const cvcCourses = await xprisma.cvcCourse.findMany({
        take: request.take,
        skip: request.skip,
        where: {
            articulatesTo: {
                some: {
                    to: {
                        some: {
                            courseCode: request.courseCode,
                            institution: {
                                id: institution.id,
                            },
                        },
                    },
                },
            },
        },
        include: {
            fulfillsGEs: {
                include: {
                    geCategory: true,
                },
                where: {
                    geCategory: {
                        institution: {
                            id: institution.id,
                        },
                    },
                },
            },
            articulatesTo: {
                include: {
                    to: {
                        where: {
                            institution: {
                                id: institution.id,
                            },
                        },
                    },
                    toInstitution: true,
                },
            },
        },
    });

    return cvcCourses.map(cvcQueryToResponse);
};

export const getCvcLastUpdated = async () => {
    const cvcCourse = await xprisma.cvcCourse.findFirst();

    if (!cvcCourse) {
        throw new Error("No CVC courses found, cannot get last updated");
    }
    return cvcCourse.updatedAt.getTime();
};
