import fs from "fs";

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
        return {
            college: cvcCourse.college,
            courseCode: cvcCourse.course.split(" - ")[0],
            courseName: cvcCourse.course.split(" - ")[1],
            cvcId: cvcCourse.cvcId,
            niceToHaves: cvcCourse.niceToHaves,
            units: cvcCourse.units,
            startDate: transformDateString(cvcCourse.term.split(" - ")[0]),
            endDate: transformDateString(cvcCourse.term.split(" - ")[1]),
            async: cvcCourse.async,
            hasOpenSeats: cvcCourse.hasOpenSeats,
            hasPrereqs: cvcCourse.hasPrereqs,
            instantEnrollment: cvcCourse.instantEnrollment,
            tuition: cvcCourse.tuition,
        };
    });

function transformDateString(dateString: string): Date {
    const current = new Date();
    const date = new Date(dateString);

    if (
        date.getMonth() > current.getMonth() ||
        (date.getMonth() === current.getMonth() &&
            date.getDate() >= current.getDate())
    ) {
        date.setFullYear(current.getFullYear());
    } else {
        date.setFullYear(current.getFullYear() + 1);
    }

    return date;
}

async function seedCvc(filepath: string) {
    logger.info("Seeding CVC courses from " + filepath);

    const cvcData = JSON.parse(fs.readFileSync(filepath, "utf8"));

    const cvcCourses = cvcData.data.map(
        (cvcCourse: z.infer<typeof cvcCourseSchema>) => {
            return cvcCourseSchema.parse(cvcCourse);
        },
    ) satisfies cvcCourse[];

    const updatedAt = new Date(cvcData.updatedAt);

    await xprisma.cvcCourse.deleteMany();
    await createManyCvcCourses(cvcCourses, updatedAt);

    logger.info(`Seeded ${cvcCourses.length} CVC courses`);
}

seedCvc("./scrapers/cvc-courses.json").catch((error) => {
    logger.error(error);
    process.exit(1);
});
