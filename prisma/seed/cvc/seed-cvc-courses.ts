import fs from "fs";

import { PrismaClient } from "@prisma/client";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import z from "zod";

import logger from "../../../src/util/logger";
import { xprisma } from "../../../src/util/prisma-client";
import { createManyCvcCourses, cvcCourse } from "../util/cvc";

const cvcCourseSchema = z
    .object({
        college: z.string(),
        course: z.string(),
        cvcId: z.string(),
        niceToHaves: z.array(z.string()),
        units: z.number(),
        term: z.string(),
        transferability: z.array(z.string()),
        tuition: z.number(),
        async: z.boolean(),
        hasOpenSeats: z.boolean(),
        hasPrereqs: z.boolean(),
        instantEnrollment: z.boolean(),
    })
    .strict()
    .transform((cvcCourse) => {
        const transformedTerm = transformTermString(cvcCourse.term);
        return {
            college: cvcCourse.college,
            courseCode: cvcCourse.course.split(" - ")[0],
            courseName: cvcCourse.course.split(" - ")[1],
            cvcId: cvcCourse.cvcId,
            niceToHaves: cvcCourse.niceToHaves,
            units: cvcCourse.units,
            startDate: transformedTerm[0],
            endDate: transformedTerm[1],
            async: cvcCourse.async,
            hasOpenSeats: cvcCourse.hasOpenSeats,
            hasPrereqs: cvcCourse.hasPrereqs,
            instantEnrollment: cvcCourse.instantEnrollment,
            tuition: cvcCourse.tuition,
        };
    });

function transformTermString(termString: string): Date[] {
    function transformDate(
        dateString: string,
        forceAfter: Date = new Date(0),
    ): Date {
        const date = new Date(dateString);

        if (
            date.getMonth() > nowOffset.getMonth() ||
            (date.getMonth() === nowOffset.getMonth() &&
                date.getDate() >= nowOffset.getDate())
        ) {
            date.setFullYear(nowOffset.getFullYear());
        } else {
            date.setFullYear(nowOffset.getFullYear() + 1);
        }

        if (date < forceAfter) {
            date.setFullYear(date.getFullYear() + 1);
        }

        return date;
    }

    const startTermString = termString.split(" - ")[0];
    const endTermString = termString.split(" - ")[1];

    // current date minus 60 days
    const nowOffset = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);

    const startDate = transformDate(startTermString);
    const endDate = transformDate(endTermString, startDate);

    return [startDate, endDate];
}

export default async function seedCvc(
    filepath: string,
    prisma: Omit<PrismaClient, ITXClientDenyList> = xprisma,
) {
    logger.info("Seeding CVC courses from " + filepath);

    const cvcData = JSON.parse(fs.readFileSync(filepath, "utf8"));

    const cvcCourses = cvcData.data.map(
        (cvcCourse: z.infer<typeof cvcCourseSchema>) => {
            return cvcCourseSchema.parse(cvcCourse);
        },
    ) satisfies cvcCourse[];

    const updatedAt = new Date(cvcData.updatedAt);

    await prisma.cvcCourse.deleteMany();
    await createManyCvcCourses(cvcCourses, updatedAt, prisma);

    logger.info(`Seeded ${cvcCourses.length} CVC courses`);
}
