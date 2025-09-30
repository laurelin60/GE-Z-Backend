import axios from "axios";
import fs from "fs/promises";
import chalk from "chalk";
// import { processPdf, processPdfBuffer } from "./assist-pdf-parser.mjs";

async function safeFetch(url, params) {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return (await axios.get(url, params)).data;
        } catch (error) {
            //console.error(`Oopsie, there was a little trouble fetching! (${attempt + 3}/3)`)
        }
    }
    // If it fails we just don't return anything and let the main try catch block catch it
}

// Get rid of duplicate articulations from different majors when parsing PDFs
function removeDuplicateArticulations(arr) {
    const seenArticulations = new Set();

    return arr
        .map((e) => {
            const uniqueArticulations = e.articulations.filter(
                (articulation) => {
                    if (!seenArticulations.has(JSON.stringify(articulation))) {
                        seenArticulations.add(JSON.stringify(articulation));
                        return true;
                    }

                    return false;
                },
            );

            return { ...e, articulations: uniqueArticulations };
        })
        .filter((e) => e.articulations.length > 0); // Get rid of the agreements that have no articulations now
}

async function fetchInstitutionMap() {
    const url = "https://assist.org/api/institutions";
    const institutions = await safeFetch(url);

    return institutions
        .filter(({ isCommunityCollege }) => !isCommunityCollege)
        .reduce((result, { id, names }) => {
            names.forEach(({ name }) => (result[name] = id));
            return result;
        }, {});
}

async function fetchAgreeingInstitutions(targetInstitutionId) {
    const url = `https://assist.org/api/institutions/${targetInstitutionId}/agreements`;
    const institutions = await safeFetch(url);

    return institutions
        .filter(({ isCommunityCollege }) => isCommunityCollege)
        .map(({ institutionParentId, institutionName }) => ({
            id: institutionParentId,
            name: institutionName,
        }));
}

async function fetchAcademicYears() {
    const url = "https://assist.org/api/AcademicYears";
    const academicYears = await safeFetch(url);
    const academicYearMap = {};
    academicYears.forEach(({ FallYear, Id }) => {
        academicYearMap[FallYear] = Id;
    });
    return academicYearMap;
}

async function fetchAgreements(
    targetInstitutionId,
    sendingInstitutionId,
    academicYearId,
    sendingInstitutionName,
) {
    const url = `https://assist.org/api/agreements?receivingInstitutionId=${targetInstitutionId}&sendingInstitutionId=${sendingInstitutionId}&academicYearId=${academicYearId}&categoryCode=major`;
    const agreementsData = await safeFetch(url);
    let agreements = [];
    if (agreementsData.reports.length === 0) return agreements; // No agreements found
    let firstKey = agreementsData.reports[0].key;

    if (isNaN(firstKey)) {
        // If agreement format is new, use their new API to get the data directly
        const apiURL = `https://assist.org/api/articulation/Agreements?Key=${academicYearId}/${sendingInstitutionId}/to/${targetInstitutionId}/AllMajors`;
        const apiResponse = await safeFetch(apiURL);
        if (apiResponse?.result == null) return []; // empty, we are using the API mode (also there are no articulations)
        let articulations = new Set();
        let rawArticulations = JSON.parse(apiResponse.result.articulations);
        rawArticulations.forEach((e) => {
            if (e.articulation.type == "Course") {
                let toCourse =
                    e.articulation.course.prefix +
                    " " +
                    e.articulation.course.courseNumber;
                // Get courses we have to take to get credit for homeCourse
                if (e.articulation.sendingArticulation == null) return; // Probably "No course articulated" or something, skip this
                let items = e.articulation.sendingArticulation.items; // Array of courses (OR). Elements will always have conjunction type AND
                items.forEach((e2) => {
                    // Since it's OR we just add a bunch of entries
                    if (e2.items?.length == 1) {
                        // Only add single courses, nobody is taking a more than one for a GE
                        articulations.add(
                            JSON.stringify({
                                // Stringify to avoid duplicates (set doesn't like json comparisons very much)
                                to: [toCourse],
                                from: [
                                    e2.items[0].prefix +
                                        " " +
                                        e2.items[0].courseNumber,
                                ], // Array for now in case this scraper is also used for other things where we need series so the format is the same
                            }),
                        );
                    }
                });
            } else if (e.articulation.type == "Series") {
                let toCourses = e.articulation.series.name.split(", ");
                // Get courses we have to take to get credit for toCourses
                if (e.articulation.sendingArticulation == null) return; // Probably "No course articulated" or something, skip this
                let items = e.articulation.sendingArticulation.items; // Array of courses (OR). Elements will always have conjunction type AND
                items.forEach((e2) => {
                    // Since it's OR we just add a bunch of entries
                    if (e2.items?.length == 1) {
                        // Only add single courses, nobody is taking a more than one for a GE
                        articulations.add(
                            JSON.stringify({
                                // Stringify to avoid duplicates (set doesn't like json comparisons very much)
                                to: toCourses,
                                from: [
                                    e2.items[0].prefix +
                                        " " +
                                        e2.items[0].courseNumber,
                                ], // Array for now in case this scraper is also used for other things where we need series so the format is the same
                            }),
                        );
                    }
                });
            }
        });
        let jsonObject = {
            assistPath: `transfer/results?year=${academicYearId}&institution=${targetInstitutionId}&agreement=${sendingInstitutionId}&agreementType=from&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=${academicYearId}/${sendingInstitutionId}/to/${targetInstitutionId}/AllMajors`,
            articulations: Array.from(articulations).map((e) => JSON.parse(e)),
        };
        agreements.push(jsonObject);
    } else {
        // If agreement format is outdated, download PDF (don't need to save it though, we can just parse it in memory)
        // Grab all the PDFs for this college at the same time
        await Promise.all(
            agreementsData.reports.map(async (report) => {
                const { label, key } = report;

                // Fetch the current PDF
                const pdfUrl = `https://assist.org/api/artifacts/${key}`; // Accessing this link in a browser instadownloads the PDF. For "previews" go to https://assist.org/transfer/report/${key}
                const pdfData = await safeFetch(pdfUrl, {
                    responseType: "arraybuffer",
                });
                let pdfArticulations = await processPdfBuffer(pdfData);
                if (pdfArticulations.length > 0) {
                    let jsonObject = {
                        assistPath: `transfer/report/${key}`,
                        articulations: pdfArticulations,
                    };
                    agreements.push(jsonObject);
                }
            }),
        );
        agreements = removeDuplicateArticulations(agreements);
    }
    return agreements;
}

async function runScript() {
    try {
        // Clear data in output file
        //fs.writeFile('assist-data.json', "", err => {});
        const targetYear = 2025; // 2025-2026 academic year
        const targetInstitutions = [
            "University of California, Irvine",
            "University of California, Santa Barbara",
            "University of California, Los Angeles",
            "University of California, San Diego",
            "University of California, Berkeley",
            "University of California, Davis", 
            "University of California, Riverside",
            "University of California, Santa Cruz",
            "University of California, Merced",
        ];
        const institutionMap = await fetchInstitutionMap();
        let bigJSON = {
            academicYear: targetYear + "-" + (targetYear + 1),
            targetInstitutions: [],
        };
        for (let i = 0; i < targetInstitutions.length; i++) {
            const targetInstitutionName = targetInstitutions[i];
            const targetInstitutionId = institutionMap[targetInstitutionName];
            if (targetInstitutionId == undefined) {
                console.log(
                    `Invalid target institution ${targetInstitutionName}, skipping!`,
                );
                continue;
            }
            console.log(
                `Initiating collection sequence for target ${chalk.greenBright(
                    targetInstitutionName,
                )} (ID: ${targetInstitutionId})`,
            );
            let agreeingInstitutions =
                await fetchAgreeingInstitutions(targetInstitutionId);
            agreeingInstitutions = agreeingInstitutions.filter(
                (e) => e.id != targetInstitutionId,
            );
            // Remove duplicates because there are somehow duplicates
            let tempSet = new Set();
            agreeingInstitutions = agreeingInstitutions.filter((e) => {
                if (tempSet.has(e.name)) return false;
                tempSet.add(e.name);
                return true;
            });
            //console.log('Institutions:', agreeingInstitutions);

            const academicYears = await fetchAcademicYears();
            //console.log('Academic Years:', academicYears);

            const academicYearId = academicYears[targetYear];
            if (academicYearId == 0) {
                console.log("Invalid academic year!");
                return;
            }

            let currTargetJSON = {
                targetInstitution: targetInstitutionName,
                sendingInstitutions: [],
            };

            // Loop through each institution and fetch agreements (no multithreading for now, we don't want to spam assist)
            for (let j = 0; j < agreeingInstitutions.length; j++) {
                const sendingInstitution = agreeingInstitutions[j];
                const { id, name } = sendingInstitution;
                let currentInstitutionAgreements = {
                    sendingInstitution: name,
                    agreements: [],
                };
                process.stdout.write(
                    `\r\r[${j + 1}/${
                        agreeingInstitutions.length
                    }] Fetching agreements for ${chalk.blueBright(
                        name,
                    )} (ID: ${id})                    `,
                );
                const agreements = await fetchAgreements(
                    targetInstitutionId,
                    id,
                    academicYearId,
                    name,
                );
                //console.log(agreements);
                currentInstitutionAgreements.agreements =
                    currentInstitutionAgreements.agreements.concat(agreements);
                // Only delay in PDF mode (to avoid spamming assist too much), delay shouldn't be required for normal mode because it's just one request
                // Super unlikely for PDF mode to only have one major with articulations (if we're wrong we just wait 7 seconds, I'm too lazy to do anything with this edge case since the impacts are minimal and I've never seen it anyway)
                // Non-PDF mode will have everything on one page so agreements will always be length 1
                // If length is 0 then ig just don't delay
                if (agreements.length > 1)
                    await new Promise((t) => setTimeout(t, 7000));
                currTargetJSON.sendingInstitutions.push(
                    currentInstitutionAgreements,
                );
            }
            console.log(
                `\rFinished fetching agreements for ${chalk.greenBright(
                    targetInstitutionName,
                )} (ID: ${targetInstitutionId})                    `,
            );
            bigJSON.targetInstitutions.push(currTargetJSON);
        }
        fs.writeFile("assist-data.json", JSON.stringify(bigJSON), (err) => {
            if (err) {
                console.error(err);
            }
        });
    } catch (error) {
        console.error("Script failed:", error);
    }
}

runScript();
