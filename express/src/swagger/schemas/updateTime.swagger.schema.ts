const updateTimeSwaggerSchema = {
    type: "object",
    properties: {
        time: {
            type: "string",
            example: "2023-01-02T03:04:05.006Z",
        },
        year: {
            type: "number",
            example: 2023,
        },
        month: {
            type: "number",
            example: 1,
        },
        date: {
            type: "number",
            example: 2,
        },
        hour: {
            type: "number",
            example: 3,
        },
    },
};

export default updateTimeSwaggerSchema;
