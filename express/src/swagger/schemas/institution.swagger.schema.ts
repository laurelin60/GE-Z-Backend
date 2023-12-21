const institutionSwaggerSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            example: "UCI",
        },
        geCategories: {
            type: "array",
            items: {
                type: "string",
                example: "III",
            },
        },
    },
};

export default institutionSwaggerSchema;