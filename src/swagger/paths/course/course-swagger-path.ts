// api path: /api/course

import courseSwaggerSchema from "../../schemas/course-swagger-schema";
import errorResponseSwaggerSchema from "../../schemas/error-response-swagger-schema";

const courseSwaggerPath = {
    get: {
        tags: ["course"],
        summary: "Get all courses and their GE categories by Institution",
        parameters: [
            {
                name: "institution",
                in: "query",
                description: "Parent Institution",
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
                                    items: courseSwaggerSchema,
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

export default courseSwaggerPath;
