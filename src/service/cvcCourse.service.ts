import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
    cvcCourseByCourseRequestSchema,
    cvcCourseByGERequestSchema,
    cvcCourseSchema,
} from "../model/cvcCourse.model";
import { xprisma } from "../util/prisma.client";

function cvcQueryToResponse(
    cvcCourse: Prisma.CvcCourseGetPayload<{
        include: {
            fulfillsGEs: true;
            articulatesTo: { include: { to: true; toInstitution: true } };
        };
    }>,
) {
    const countMap = new Map();
    cvcCourse.fulfillsGEs.forEach(({ category }) =>
        countMap.set(category, (countMap.get(category) || 0) + 1),
    );
    const fulfillsGEs = Array.from(countMap, ([val, count]) => ({
        category: val,
        count,
    }));

    return {
        sendingInstitution: cvcCourse.college,
        courseCode: cvcCourse.courseCode,
        courseName: cvcCourse.courseName,
        cvcId: cvcCourse.cvcId,
        assistPath: cvcCourse.articulatesTo[0].assistPath,
        niceToHaves: cvcCourse.niceToHaves,
        units: cvcCourse.units,
        tuition: cvcCourse.tuition,
        async: cvcCourse.async,
        hasOpenSeats: cvcCourse.hasOpenSeats,
        hasPrereqs: cvcCourse.hasPrereqs,
        instantEnrollment: cvcCourse.instantEnrollment,
        fulfillsGEs: fulfillsGEs,
        articulatesTo: cvcCourse.articulatesTo.flatMap((articulation) =>
            articulation.to.map((course) => course.courseCode),
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
        include: {
            fulfillsGEs: true,
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
            fulfillsGEs: true,
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
    const cvcCourse = await xprisma.cvcCourse.findFirst({
        orderBy: {
            updatedAt: "desc",
        },
    });

    if (!cvcCourse) {
        throw new Error("No CVC courses found");
    }
    return cvcCourse.updatedAt.getTime();
};
