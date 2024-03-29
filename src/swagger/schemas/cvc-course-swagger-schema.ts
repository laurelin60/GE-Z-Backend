import arrayOfGESchema from "./array-of-ge-swagger.schema";

const cvcCourseSwaggerSchema = {
    type: "object",
    properties: {
        sendingInstitution: {
            type: "string",
            example: "Irvine Valley College",
        },
        courseCode: {
            type: "string",
            example: "ANTH2",
        },
        courseName: {
            type: "string",
            example: "Cultural Anthropology",
        },
        cvcId: {
            type: "string",
            example: "1234567",
        },
        assistPath: {
            type: "string",
            example: "transfer/results?...",
        },
        niceToHaves: {
            type: "array",
            items: {
                type: "string",
                example: "Zero Textbook Cost",
            },
        },
        units: {
            type: "number",
            example: 3,
        },
        tuition: {
            type: "number",
            example: 138,
        },
        startDate: {
            type: "number",
            example: 1700000000,
        },
        endDate: {
            type: "number",
            example: 1700000000,
        },
        async: {
            type: "boolean",
            example: true,
        },
        hasOpenSeats: {
            type: "boolean",
            example: true,
        },
        hasPrereqs: {
            type: "boolean",
            example: false,
        },
        instantEnrollment: {
            type: "boolean",
            example: true,
        },
        fulfillsGEs: arrayOfGESchema,
        articulatesTo: {
            type: "array",
            items: {
                type: "string",
                example: "ANTHRO2A",
            },
        },
    },
};

export default cvcCourseSwaggerSchema;
