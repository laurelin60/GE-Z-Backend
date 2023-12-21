const errorResponseSwaggerSchema = {
    type: "object",
    properties: {
        status: {
            type: "number",
            example: 400,
        },
        error: {
            type: "any",
            example: "any",
        }
    }
};

export default errorResponseSwaggerSchema;