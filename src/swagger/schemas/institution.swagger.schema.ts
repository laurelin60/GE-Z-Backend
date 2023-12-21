const institutionSwaggerSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            example: "University of California, Irvine",
        },
        code: {
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