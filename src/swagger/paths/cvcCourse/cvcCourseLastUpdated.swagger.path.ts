// api path: /api/cvc-course/last-updated

import updateTimeSwaggerSchema from "../../schemas/updateTime.swagger.schema";

const cvcCourseLastUpdatedSwaggerPath = {
    get: {
        tags: ["cvc-course"],
        summary: "Get last updated date of CVC courses in UTC",
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
                                data: updateTimeSwaggerSchema,
                            },
                        },
                    },
                },
            },
        },
    },
};

export default cvcCourseLastUpdatedSwaggerPath;