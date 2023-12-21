// api path: /api/course

import courseSwaggerSchema from "../../schemas/course.swagger.schema";

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
                description: "Invalid institution",
            },
        },
    },
};

export default courseSwaggerPath;
