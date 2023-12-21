// api path: /api/status

const statusSwaggerPath = {
    get: {
        tags: ["status"],
        summary: "Check server status",
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
                                    type: "string",
                                    example: "OK",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default statusSwaggerPath;
