import {
    getCvcCoursesByCourse,
    getCvcCoursesByGE,
    getCvcLastUpdated,
} from "../service/cvc-service";
import { getInstitutions } from "../service/institution-service";

import logger from "./logger";

async function benchmark(query: () => Promise<void>, iterations: number) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (iterations <= 0) {
        return;
    }
    const startFirst = performance.now();
    await query();
    const firstTime = (performance.now() - startFirst).toFixed(3);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await query();
    }

    const end = performance.now();
    const avgTime = ((end - start) / iterations).toFixed(3);
    logger.info(
        `${query.name.padEnd(35)}first: ${firstTime}ms | cached: ${avgTime}ms`,
    );
}

async function getInstitutionsBenchmark() {
    await getInstitutions();
}

// async function getCoursesByInstitutionBenchmark() {
//     await getCoursesByInstitution({
//         institution: "University of California, Irvine",
//     });
// }

async function getCvcCoursesByGEBenchmark() {
    await getCvcCoursesByGE({
        institution: "University of California, Irvine",
        ge: "III",
    });
}

async function getCvcCoursesByCourseBenchmark() {
    await getCvcCoursesByCourse({
        institution: "University of California, Irvine",
        courseCode: "ANTHRO2A",
    });
}

async function getCvcLastUpdatedBenchmark() {
    await getCvcLastUpdated();
}

async function runBenchmarks() {
    const ITERATIONS = 10;

    await benchmark(getInstitutionsBenchmark, ITERATIONS);
    // await benchmark(getCoursesByInstitutionBenchmark, ITERATIONS);
    await benchmark(getCvcCoursesByGEBenchmark, ITERATIONS);
    await benchmark(getCvcCoursesByCourseBenchmark, ITERATIONS);
    await benchmark(getCvcLastUpdatedBenchmark, ITERATIONS);
}

runBenchmarks().catch((error) => {
    logger.error(error);
    process.exit(1);
});
