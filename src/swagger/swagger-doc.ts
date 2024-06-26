import { version } from "../../package.json";

import courseSwaggerPath from "./paths/course/course-swagger-path";
import cvcCourseCourseSwaggerPath from "./paths/cvcCourse/cvc-course-course-swagger-path";
import cvcCourseLastUpdatedSwaggerPath from "./paths/cvcCourse/cvc-course-last-updated-swagger-path";
import cvcCourseSwaggerPath from "./paths/cvcCourse/cvc-course-swagger-path";
import institutionSwaggerPath from "./paths/institution/institution-swagger-path";
import statusSwaggerPath from "./paths/status/status-swagger-path";
import arrayOfGESchema from "./schemas/array-of-ge-swagger.schema";
import courseSwaggerSchema from "./schemas/course-swagger-schema";
import cvcCourseSwaggerSchema from "./schemas/cvc-course-swagger-schema";
import errorResponseSwaggerSchema from "./schemas/error-response-swagger-schema";
import institutionSwaggerSchema from "./schemas/institution-swagger-schema";

export const swaggerDefinition = {
    openapi: "3.1.0",
    info: {
        title: "GE-Z Backend",
        description:
            "GE-Z Backend Docs [Github](https://github.com/laurelin60/GE-Z-Backend-Express)",
        version: version,
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT}/api`,
        },
        {
            url: "https://ge-z.info/api",
        },
    ],
    tags: [
        {
            name: "status",
            description: "Operations for checking server status",
        },
        {
            name: "cvc-course",
            description: "Operations for CVC courses",
        },
        {
            name: "institution",
            description: "Operations for Institutions",
        },
        {
            name: "course",
            description: "Operations for Courses",
        },
    ],
    paths: {
        "/status": statusSwaggerPath,
        "/cvc-courses": cvcCourseSwaggerPath,
        "/cvc-courses/course": cvcCourseCourseSwaggerPath,
        "/cvc-courses/last-updated": cvcCourseLastUpdatedSwaggerPath,
        "/institutions": institutionSwaggerPath,
        "/courses": courseSwaggerPath,
    },

    components: {
        schemas: {
            Institution: institutionSwaggerSchema,
            Course: courseSwaggerSchema,
            CvcCourse: cvcCourseSwaggerSchema,
            ArrayOfGE: arrayOfGESchema,
            ErrorResponse: errorResponseSwaggerSchema,
        },
    },
};

export const options = {
    swaggerDefinition,
    apis: ["./routes/index.js"],
};
