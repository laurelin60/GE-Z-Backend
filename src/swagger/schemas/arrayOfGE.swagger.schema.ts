const arrayOfGESchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            category: {
                type: "string",
                example: "III",
            },
            count: {
                type: "number",
                example: 1,
            }
        },
    },
};

export default arrayOfGESchema;