// api path: /api/cvc-course

import updateTimeSwaggerSchema from "../../schemas/updateTime.swagger.schema";
import cvcCourseSwaggerSchema from "../../schemas/cvcCourse.swagger.schema";

const cvcCourseSwaggerPath = {
    get: {
        tags: ["cvc-course"],
        summary: "Find CVC courses by parent institution & GE category",
        parameters: [
            {
                name: "institution",
                in: "query",
                description: "Parent Institution of the GE",
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
                name: "ge",
                in: "query",
                description: "GE category",
                required: true,
                schema: {
                    type: "string",
                },
                examples: {
                    category: {
                        value: "Va",
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
                description: "Invalid institution or GE category",
            },
        },
    },
};

export default cvcCourseSwaggerPath;
