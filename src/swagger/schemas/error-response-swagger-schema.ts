const errorResponseSwaggerSchema = {
    type: "object",
    properties: {
        status: {
            type: "number",
            example: 400,
        },
        error: {
            type: "object",
        },
    },
};

export default errorResponseSwaggerSchema;
