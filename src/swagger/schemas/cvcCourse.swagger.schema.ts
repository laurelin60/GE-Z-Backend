import arrayOfGESchema from "./arrayOfGE.swagger.schema";

const cvcCourseSwaggerSchema = {
    type: "object",
    properties: {
        college: {
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
        term: {
            type: "string",
            example: "Jan 16 - May 22",
        },
        startYear: {
            type: "number",
            example: 2024,
        },
        startMonth: {
            type: "number",
            example: 1,
        },
        startDay: {
            type: "number",
            example: 16,
        },
        endYear: {
            type: "number",
            example: 2024,
        },
        endMonth: {
            type: "number",
            example: 5,
        },
        endDay: {
            type: "number",
            example: 22,
        },
        tuition: {
            type: "number",
            example: 138,
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
                example: "ANTHRO 2A",
            },
        },
    },
};

export default cvcCourseSwaggerSchema;