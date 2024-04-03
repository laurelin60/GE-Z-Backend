import { Prisma } from "@prisma/client";
import { z } from "zod";

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
        articulatesTo: cvcCourse.articulatesTo.flatMap((articulation) =>
            articulation.to.map(
                (course) => course.courseDepartment + " " + course.courseNumber,
            ),
        ),
    } satisfies z.infer<typeof cvcCourseSchema>;
}

export const getCvcCoursesByGE = async (
    request: z.infer<typeof cvcCourseByGERequestSchema>,
) => {
    const cvcCourses = await xprisma.cvcCourse.findMany({
        take: request.take,
        skip: request.skip,
        where: {
            fulfillsGEs: {
                some: {
                    geCategory: {
                        institution: {
                            OR: [
                                { name: request.institution },
                                { code: request.institution },
                            ],
                        },
                        category: request.ge,
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
                            OR: [
                                { name: request.institution },
                                { code: request.institution },
                            ],
                        },
                    },
                },
            },
            articulatesTo: {
                where: {
                    toInstitution: {
                        OR: [
                            { name: request.institution },
                            { code: request.institution },
                        ],
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
                                OR: [
                                    { name: request.institution },
                                    { code: request.institution },
                                ],
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
                            OR: [
                                { name: request.institution },
                                { code: request.institution },
                            ],
                        },
                    },
                },
            },
            articulatesTo: {
                include: {
                    to: {
                        where: {
                            institution: {
                                OR: [
                                    { name: request.institution },
                                    { code: request.institution },
                                ],
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
        logger.error("No CVC courses exist, unable to get last updated time");
        return new Date(0).getTime();
    }
    return cvcCourse.updatedAt.getTime();
};
