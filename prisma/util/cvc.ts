import { xprisma } from "../../src/util/prisma.client";

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

export async function createManyCvcCourses(cvcCourses: cvcCourse[]) {
    await xprisma.cvcCourse.createMany({
        data: cvcCourses,
        skipDuplicates: true,
    });
}
