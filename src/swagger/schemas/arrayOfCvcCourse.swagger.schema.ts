import cvcCourseSwaggerSchema from "./cvcCourse.swagger.schema";

const arrayOfCvcCourseSwaggerSchema = {
    type: "array",
    items: {
        cvcCourseSwaggerSchema,
    },
};

export default arrayOfCvcCourseSwaggerSchema;