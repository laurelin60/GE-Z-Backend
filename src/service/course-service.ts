import { z } from "zod";

import {
    coursesByInstitutionRequestSchema,
    courseSchema,
} from "../model/course-model";
import { xprisma } from "../util/prisma-client";

export const getCoursesByInstitution = async (
    request: z.infer<typeof coursesByInstitutionRequestSchema>,
) => {
    const courseResult = await xprisma.course.findMany({
        take: request.take,
        skip: request.skip,
        where: {
            institution: {
                OR: [
                    { name: request.institution },
                    { code: request.institution },
                ],
            },
        },
        include: {
            institution: true,
            geCategories: true,
        },
    });

    return courseResult.map((course) => {
        return {
            courseCode: course.courseCode,
            courseDepartment: course.courseDepartment,
            courseNumber: course.courseNumber,
            courseName: course.courseName ? course.courseName : "",
            geCategories: course.geCategories.map(
                (geCategory) => geCategory.category,
            ),
        } satisfies z.infer<typeof courseSchema>;
    });
};
