import logger from "./logger";
import { getCoursesByInstitution } from "../service/course.service";
import {
    getCvcCoursesByCourse,
    getCvcCoursesByGE,
    getCvcLastUpdated,
} from "../service/cvcCourse.service";
import { getInstitutions } from "../service/institution.service";

async function benchmark(
    query: () => void,
    iterations: number,
    skipFirst = false,
) {
    if (iterations <= 0) {
        return;
    }
    if (skipFirst) {
        await query();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await query();
    }
    const end = performance.now();
    const avgTime = ((end - start) / iterations).toFixed(2);
    logger.info(`${query.name} | avg: ${avgTime}ms`);
}

async function getInstitutionsBenchmark() {
    await getInstitutions();
}

async function getCoursesByInstitutionBenchmark() {
    await getCoursesByInstitution({
        institution: "University of California, Irvine",
    });
}

async function getCvcCoursesByGEBenchmark() {
    const geList = [
        "Ia",
        "Ib",
        "II",
        "III",
        "IV",
        "Va",
        "Vb",
        "VI",
        "VII",
        "VIII",
    ];
    await getCvcCoursesByGE({
        institution: "University of California, Irvine",
        ge: geList[Math.floor(Math.random() * geList.length)],
    });
}

async function getCvcCoursesByCourseBenchmark() {
    await getCvcCoursesByCourse({
        institution: "University of California, Irvine",
        courseCode: "ANTHRO 2A",
    });
}

async function getCvcLastUpdatedBenchmark() {
    await getCvcLastUpdated();
}

async function runBenchmarks() {
    await benchmark(getInstitutionsBenchmark, -1);
    await benchmark(getCoursesByInstitutionBenchmark, -1);
    await benchmark(getCvcCoursesByGEBenchmark, 1_000, true);
    await benchmark(getCvcCoursesByCourseBenchmark, -1);
    await benchmark(getCvcLastUpdatedBenchmark, -1);
}

runBenchmarks().catch((error) => {
    logger.error(error);
    process.exit(1);
});
