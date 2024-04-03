import axios from "axios";
import z from "zod";

import formatCode from "../util/format-code";
import { courseType, institutionType } from "../util/institution";

import Institution from "./institution";

export default class Ucsb extends Institution {
    constructor() {
        const name = "University of California, Santa Barbara";
        const code = "UCSB";
        const geCategories = ["A1", "A2", "B", "C", "D", "E", "F", "G"];

        super(name, code, geCategories);
    }

    public async getInstitution(): Promise<institutionType> {
        const courses = await getUcsbCourses();

        return {
            name: this.name,
            code: this.code,
            geCategories: this.geCategories,
            courses,
        };
    }
}

async function getUcsbCourses(): Promise<courseType[]> {
    const url =
        "https://app.coursedog.com/api/v1/cm/ucsb/courses/search/%24filters?skip=0&limit=1000000000&columns=customFields.generalSubjectAreas%2Ccode";
    const response = await axios.get(url);

    if (response.status == 200) {
        return response.data.data
            .map((course: z.infer<typeof responseCourseSchema>) => {
                try {
                    return transformSchema.parse(course) satisfies courseType;
                } catch (e) {
                    if (e instanceof z.ZodError) {
                        return;
                    }
                    Error();
                }
            })
            .filter((course: undefined) => course !== undefined);
    } else {
        throw new Error(
            `Failed to fetch UCSB courses. Status ${response.status}`,
        );
    }
}

const responseCourseSchema = z
    .object({
        _id: z.any(),
        courseGroupId: z.any(),
        effectiveEndDate: z.any(),
        effectiveStartDate: z.any(),
        id: z.any(),
        subjectCode: z.any(),
        requestStatus: z.any(),

        code: z.string(),
        courseNumber: z.string(),
        departments: z.array(z.string()),
        customFields: z.object({
            generalSubjectAreas: z.array(z.string()).or(z.undefined()),
        }),
    })
    .strict();

const transformSchema = responseCourseSchema.transform((course) => ({
    courseCode: formatCode(course.code),
    courseNumber: course.courseNumber,
    courseName: "",
    courseDepartment: course.departments[0] ? course.departments[0] : "",
    geCategories: course.customFields.generalSubjectAreas
        ? course.customFields.generalSubjectAreas
        : [],
}));
