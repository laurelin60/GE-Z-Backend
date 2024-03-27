const courseSwaggerSchema = {
    type: "object",
    properties: {
        courseCode: {
            type: "string",
            example: "ANTHRO 2A",
        },
        courseName: {
            type: "string",
            example: "Introduction to Sociocultural Anthropology",
        },
        courseDepartment: {
            type: "string",
            example: "ANTHRO",
        },
        courseNumber: {
            type: "string",
            example: "2A",
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

export default courseSwaggerSchema;
