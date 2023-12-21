// api path: /api/cvc-course/course

import cvcCourseSwaggerSchema from "../../schemas/cvcCourse.swagger.schema";
import errorResponseSwaggerSchema from "../../schemas/errorResponse.swagger.schema";

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
            {
                name: "take",
                in: "query",
                description: "Number to return",
                required: false,
                schema: {
                    type: "number",
                    example: 10,
                },
            },
            {
                name: "skip",
                in: "query",
                description: "Number to skip",
                required: false,
                schema: {
                    type: "number",
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
                                    items: cvcCourseSwaggerSchema,
                                },
                                lastUpdated: {
                                    type: "number",
                                    example: 1234567891011,
                                },
                            },
                        },
                    },
                },
            },
            "400": {
                description: "Invalid institution or GE category",
                content: {
                    "application/json": {
                        schema: errorResponseSwaggerSchema,
                    },
                },
            },
        },
    },
};

export default cvcCourseCourseSwaggerPath;
