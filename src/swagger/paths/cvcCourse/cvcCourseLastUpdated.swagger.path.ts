// api path: /api/cvc-course/last-updated


const cvcCourseLastUpdatedSwaggerPath = {
    get: {
        tags: ["cvc-course"],
        summary: "Get last updated date of CVC courses as a UNIX timestamp",
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
                                    type: "object",
                                    properties: {
                                        lastUpdated: {
                                            type: "number",
                                            example: 1234567891011,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default cvcCourseLastUpdatedSwaggerPath;