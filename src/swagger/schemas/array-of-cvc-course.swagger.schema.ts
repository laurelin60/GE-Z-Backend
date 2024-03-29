import cvcCourseSwaggerSchema from "./cvc-course-swagger-schema";

const arrayOfCvcCourseSwaggerSchema = {
    type: "array",
    items: {
        cvcCourseSwaggerSchema,
    },
};

export default arrayOfCvcCourseSwaggerSchema;
