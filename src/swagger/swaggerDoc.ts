import { version } from "../../package.json";
import cvcCourseSwaggerSchema from "./schemas/cvcCourse.swagger.schema";
import institutionSwaggerSchema from "./schemas/institution.swagger.schema";
import courseSwaggerSchema from "./schemas/course.swagger.schema";
import statusSwaggerPath from "./paths/status/status.swagger.path";
import cvcCourseSwaggerPath from "./paths/cvcCourse/cvcCourse.swagger.path";
import cvcCourseCourseSwaggerPath from "./paths/cvcCourse/cvcCourseCourse.swagger.path";
import cvcCourseLastUpdatedSwaggerPath from "./paths/cvcCourse/cvcCourseLastUpdated.swagger.path";
import institutionSwaggerPath from "./paths/institution/institution.swagger.path";
import courseSwaggerPath from "./paths/course/course.swagger.path";
import arrayOfGESchema from "./schemas/arrayOfGE.swagger.schema";
import errorResponseSwaggerSchema from "./schemas/errorResponse.swagger.schema";

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
