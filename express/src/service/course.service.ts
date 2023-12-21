import { z } from "zod";
import { xprisma } from "../util/prisma.client";
import {
    coursesByInstitutionRequestSchema,
    coursesByInstitutionResponseSchema,
} from "../model/course.model";

export const getCoursesByInstitution = async (
    institutionCourseRequest: z.infer<typeof coursesByInstitutionRequestSchema>,
) => {
    const courseResult = await xprisma.course.findMany({
        where: {
            institution: {
                OR: [
                    { name: institutionCourseRequest.institution },
                    { code: institutionCourseRequest.institution },
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
        } satisfies z.infer<typeof coursesByInstitutionResponseSchema>;
    });
};
