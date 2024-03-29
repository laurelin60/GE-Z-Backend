import axios from "axios";
import z from "zod";

import logger from "../../../src/util/logger";
import formatCode from "../util/format-code";
import { course, institution } from "../util/institution";

export default async function getUciInstitution() {
    logger.info("Fetching UCI");

    const name = "University of California, Irvine";
    const code = "UCI";
    // prettier-ignore
    const geCategories = ["Ia", "Ib", "II", "III", "IV", "Va", "Vb", "VI", "VII", "VIII"];

    const courses = await getUciCourses();

    logger.info(`Found ${courses.length} UCI courses`);

    return {
        name,
        code,
        geCategories,
        courses,
    } satisfies institution;
}

async function getUciCourses(): Promise<course[]> {
    const url = "https://api-next.peterportal.org/v1/graphql";
    const headers = { "Content-Type": "application/json" };
    const data = {
        query: `query ExampleQuery { allCourses {id, title, geList, courseNumber, department } }`,
    };

    const response = await axios.post(url, data, { headers });

    if (response.status == 200) {
        return response.data.data.allCourses.map(
            (course: z.infer<typeof responseCourseSchema>) => {
                return transformSchema.parse(course) satisfies course;
            },
        );
    } else {
        throw new Error(
            `Failed to fetch UCI courses. Status ${response.status}`,
        );
    }
}

const responseCourseSchema = z
    .object({
        id: z.string(),
        title: z.string(),
        geList: z.array(z.string()),
        courseNumber: z.string(),
        department: z.string(),
    })
    .strict()
    .transform((course) => {
        return {
            ...course,
            geList: course.geList.map((ge) => {
                const match = ge.match(/GE (.+?):/);
                return match ? match[1].trim() : "";
            }),
        };
    });

const transformSchema = responseCourseSchema.transform((course) => {
    return {
        courseCode: formatCode(course.id),
        courseName: course.title,
        courseNumber: course.courseNumber,
        courseDepartment: course.department,
        geCategories: course.geList || [],
    } satisfies course;
});
