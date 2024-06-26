import { PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

import { xprisma } from "../../../src/util/prisma-client";

export type cvcCourse = {
    college: string;
    courseCode: string;
    courseName: string;
    cvcId: string;
    niceToHaves: string[];
    units: number;
    startDate: Date;
    endDate: Date;
    async: boolean;
    hasOpenSeats: boolean;
    hasPrereqs: boolean;
    instantEnrollment: boolean;
    tuition: number;
};

export async function createManyCvcCourses(
    cvcCourses: cvcCourse[],
    updatedAt: Date,
    prisma: Omit<PrismaClient, ITXClientDenyList> = xprisma,
) {
    const updatedCvcCourses = cvcCourses.map((course) => ({
        ...course,
        updatedAt,
    }));

    await prisma.cvcCourse.createMany({
        data: updatedCvcCourses,
        skipDuplicates: true,
    });
}
