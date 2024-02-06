import fs from "fs";
import path from "path";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import logger from "../../src/util/logger";
import { xprisma } from "../../src/util/prisma.client";

function formatTerm(term: string) {
    const monthAbbreviations: { [key: string]: number } = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12,
    };

    const match = term.match(
        /(?<startMonth>.*) (?<startDay>.*) - (?<endMonth>.*) (?<endDay>.*)/,
    );

    if (
        match?.groups?.startMonth === undefined ||
        match?.groups?.endMonth === undefined ||
        match?.groups?.startDay === undefined ||
        match?.groups?.endDay === undefined
    ) {
        throw new Error(`Invalid term: ${term}`);
    }
    const startMonth = monthAbbreviations[match?.groups?.startMonth];
    const startDay = parseInt(match?.groups?.startDay);
    const endMonth = monthAbbreviations[match?.groups?.endMonth];
    const endDay = parseInt(match?.groups?.endDay);

    const currentDate = new Date();
    const cvcStartDate = new Date(
        currentDate.getFullYear(),
        startMonth - 1,
        startDay,
    );
    const cvcEndDate = new Date(
        currentDate.getFullYear(),
        endMonth - 1,
        endDay,
    );

    const startYear =
        cvcStartDate < currentDate
            ? currentDate.getFullYear() + 1
            : currentDate.getFullYear();
    const endYear =
        cvcEndDate < currentDate
            ? currentDate.getFullYear() + 1
            : currentDate.getFullYear();

    return {
        startDay: startDay,
        startMonth: startMonth,
        startYear: startYear,
        endDay: endDay,
        endMonth: endMonth,
        endYear: endYear,
    };
}

function formatCourseCode(courseName: string) {
    const match = courseName.match(/(?<code>.+?) - (?<name>.+)/);

    if (
        match?.groups?.code === undefined ||
        match?.groups?.name === undefined
    ) {
        throw new Error(`Invalid course name: ${courseName}`);
    }

    return {
        code: match?.groups?.code,
        name: match?.groups?.name,
    };
}

export async function seedCvc(seedFilePath: string) {
    logger.info("Seeding CvcCourses");

    const data = fs.readFileSync(
        path.resolve(__dirname, seedFilePath),
        "utf-8",
    );
    const cvcCourses = JSON.parse(data);

    const cvcCourseSchema = z.object({
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
    });

    const cvcCoursesToCreate = cvcCourses.data.map(
        (cvcCourse: z.infer<typeof cvcCourseSchema>) => {
            const cvcCourseParsed = cvcCourseSchema.parse(cvcCourse);

            const {
                startYear,
                startMonth,
                startDay,
                endYear,
                endMonth,
                endDay,
            } = formatTerm(cvcCourseParsed.term);

            return {
                college: cvcCourseParsed.college,
                courseCode: formatCourseCode(cvcCourseParsed.course).code,
                courseName: formatCourseCode(cvcCourseParsed.course).name,
                cvcId: cvcCourseParsed.cvcId,
                niceToHaves: cvcCourseParsed.niceToHaves,
                units: cvcCourseParsed.units,
                term: cvcCourseParsed.term,
                startYear: startYear,
                startMonth: startMonth,
                startDay: startDay,
                endYear: endYear,
                endMonth: endMonth,
                endDay: endDay,
                tuition: cvcCourseParsed.tuition,
                async: cvcCourseParsed.async,
                hasOpenSeats: cvcCourseParsed.hasOpenSeats,
                hasPrereqs: cvcCourseParsed.hasPrereqs,
                instantEnrollment: cvcCourseParsed.instantEnrollment,
            } satisfies Prisma.CvcCourseCreateInput;
        },
    );

    await xprisma.cvcCourse.createMany({
        data: cvcCoursesToCreate,
        skipDuplicates: true,
    });

    const added = await xprisma.cvcCourse.findMany();
    logger.info(`Seeded ${added.length} CvcCourses`);
}
