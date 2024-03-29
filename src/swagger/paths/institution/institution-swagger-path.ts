// api path: /api/institution

import institutionSwaggerSchema from "../../schemas/institution-swagger-schema";

const institutionSwaggerPath = {
    get: {
        tags: ["institution"],
        summary: "Get all institutions and their GE categories",
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
                                    items: institutionSwaggerSchema,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default institutionSwaggerPath;
