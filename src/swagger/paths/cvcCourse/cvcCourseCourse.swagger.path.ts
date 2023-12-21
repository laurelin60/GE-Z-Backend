// api path: /api/cvc-course/course

import updateTimeSwaggerSchema from "../../schemas/updateTime.swagger.schema";
import cvcCourseSwaggerSchema from "../../schemas/cvcCourse.swagger.schema";

const cvcCourseCourseSwaggerPath = {
    get: {
        tags: ["cvc-course"],
        summary: "Find CVC courses by parent institution & course code",
        parameters: [
            {
                name: "institution",
                in: "query",
                description: "Parent Institution of the Course",
                required: true,
                schema: {
                    type: "string",
                },
                examples: {
                    name: {
                        value: "University of California, Irvine",
                    },
                    code: {
                        value: "UCI",
                    },
                },
            },
            {
                name: "courseCode",
                in: "query",
                description: "Course code",
                required: true,
                schema: {
                    type: "string",
                },
                examples: {
                    courseCode: {
                        value: "ANTHRO 2A",
                    },
                },
            },
        ],
        responses: {
            "200": {
                description: "Success",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "number",
                                    example: 200,
                                },
                                data: {
                                    type: "array",
                                    items: cvcCourseSwaggerSchema
                                },
                                lastUpdated: updateTimeSwaggerSchema,
                            },
                        },
                    },
                },
            },
            "400": {
                description: "Invalid institution or course code",
            },
        },
    },
};

export default cvcCourseCourseSwaggerPath;
