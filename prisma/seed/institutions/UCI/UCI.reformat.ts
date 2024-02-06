import * as fs from "fs";
import * as path from "path";

import { z } from "zod";

import logger from "../../../../src/util/logger";

function formatGE(ge: string) {
    const match = ge.match(/GE (?<category>.*):.*/);
    return match?.groups?.category;
}

export function reformat() {
    const originalSchema = z.object({
        data: z.object({
            allCourses: z.array(
                z.object({
                    department: z.string(),
                    number: z.string(),
                    ge_list: z.array(z.string()),
                }),
            ),
        }),
    });

    const reformattedSchema = z.array(
        z.object({
            code: z.string(),
            department: z.string(),
            number: z.string(),
            ge_list: z.array(z.string()),
        }),
    );

    const inputFile = "UCI.courses.json";
    const inputData = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, inputFile), "utf-8"),
    );

    try {
        const parsedData = originalSchema.parse(inputData);

        const reformattedData = parsedData.data.allCourses.map((course) => ({
            code: `${course.department} ${course.number}`,
            department: course.department,
            number: course.number,
            ge_list: course.ge_list.map(formatGE),
        }));

        reformattedSchema.parse(reformattedData);

        const outputFile = "UCI.courses.reformat.json";
        const reformattedJson = JSON.stringify(reformattedData, null, 2);
        fs.writeFileSync(
            path.resolve(__dirname, outputFile),
            reformattedJson,
            "utf-8",
        );
    } catch (error) {
        logger.fatal(error);
    }
}
