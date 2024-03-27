import { PrismaClient } from "@prisma/client";
import express from "express";

import { getCoursesByInstitutionHandler } from "./controller/course-controller";
import {
    getCvcLastUpdatedHandler,
    getCvcCoursesByGEHandler,
} from "./controller/cvc-controller";
import { getCvcCoursesByCourseHandler } from "./controller/cvc-controller";
import { getInstitutionsHandler } from "./controller/institution-controller";
import swagger from "./swagger/swagger";

const prisma = new PrismaClient();

const router = express.Router();

// docs
router.get("/", (req, res) => {
    res.redirect("/api/docs");
});
swagger("/docs", router);

// status
router.get("/status", async (req, res) => {
    try {
        await prisma.$connect();
        res.status(200).json({ status: 200, data: "OK" });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: "Database connection failed",
        });
    } finally {
        await prisma.$disconnect();
    }
});

// cvc-courses
router.get("/cvc-courses", getCvcCoursesByGEHandler);
router.get("/cvc-courses/course", getCvcCoursesByCourseHandler);
router.get("/cvc-courses/last-updated", getCvcLastUpdatedHandler);

// institutions
router.get("/institutions", getInstitutionsHandler);

// courses
router.get("/courses", getCoursesByInstitutionHandler);

export default router;
