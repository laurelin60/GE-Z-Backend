import express from "express";
import {
    cvcLastUpdatedHandler,
    getCvcCoursesByGEHandler,
} from "./controller/cvcCourse.controller";
import { getCvcCoursesByCourseHandler } from "./controller/cvcCourse.controller";
import { getInstitutionsHandler } from "./controller/institution.controller";
import { getCoursesByInstitutionHandler } from "./controller/course.controller";
import swagger from "./swagger/swagger";

const router = express.Router();

// docs
router.get("/", (req, res) => {
    res.redirect("/api/docs");
});
swagger("/docs", router);

// status
router.get("/status", (req, res) => {
    res.status(200).json({ status: 200, data: "OK" });
});

// cvc-courses
router.get("/cvc-courses", getCvcCoursesByGEHandler);
router.get("/cvc-courses/course", getCvcCoursesByCourseHandler);
router.get("/cvc-courses/last-updated", cvcLastUpdatedHandler);

// institutions
router.get("/institutions", getInstitutionsHandler);

// courses
router.get("/courses", getCoursesByInstitutionHandler);

export default router;
