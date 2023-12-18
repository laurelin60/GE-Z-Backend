import fs from 'fs/promises';
import UniversityManager from './universities/university-manager.js';
import { writeGeCourses } from './db.js';

async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`Error reading JSON file at ${filePath}: ${error.message}`);
        throw error;
    }
}

// Turn the CVC term string into four ints 
function parseDateRange(dateString) {
    const monthMap = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
    };

    const [startMonth, startDay, endMonth, endDay] = dateString.match(/[a-zA-Z]+|\d+/g);

    return {
        startDay: parseInt(startDay, 10),
        startMonth: monthMap[startMonth],
        endDay: parseInt(endDay, 10),
        endMonth: monthMap[endMonth],
    };
}

async function main() {
    const uniMan = new UniversityManager();
    await uniMan.initialize();
    const assistData = await readJSONFile('../scrapers/assist-data.json');
    const cvcData = await readJSONFile('../scrapers/cvc-courses.json');

    const assistMap = {};
    assistData.targetInstitutions.forEach(targetInstitution => {
        const innerMap = {};
        // Go through the assist data and create a map of sending institution -> articulation (from -> { to, assistPath })
        targetInstitution.sendingInstitutions.forEach(sendingInstitution => {
            const innerInnerMap = {};
            sendingInstitution.agreements.forEach(agreement => {
                agreement.articulations.forEach(articulation => {
                    if (articulation.from.length == 1) { // Any that weren't should have been fitlered out by the scraper already but I'm double checking in case the wrong scraper version was used or something 
                        innerInnerMap[articulation.from[0].replaceAll(' ', '')] = { articulatesTo: articulation.to, assistPath: agreement.assistPath }; // Remove spaces in from course code cuz cvc stores it that way 
                    }
                });
            });
            innerMap[sendingInstitution.sendingInstitution] = innerInnerMap;
        });
        assistMap[targetInstitution.targetInstitution] = innerMap;
    });

    for (let i = 0; i < assistData.targetInstitutions.length; i++) { 
        const targetInstitution = assistData.targetInstitutions[i].targetInstitution; // This is just the name of the institution 
        const targetUniMap = assistMap[targetInstitution];
        if (targetUniMap == undefined) {
            console.log(`Mapping for ${targetInstitution} was not properly loaded, skipping!`); // This should never happen 
            return; 
        }
        let currUniObj = uniMan.getUniversity(targetInstitution);
        if (currUniObj == undefined) {
            console.log(`University manager has no object for ${targetInstitution}, skipping!`); // This happens if a university is added to assist-data.json but not the university manager thingy 
            return;
        }
        console.log(`Initiating mapping for ${targetInstitution}`);
        // Create a new dict of geCategory -> [courseCode]
        const geMap = {};
        const geCategories = currUniObj.getGeCategories();
        geCategories.forEach(geCategory => {
            geMap[geCategory] = [];
        });
        // Go through CVC data and make new JSON objects 
        cvcData.data.forEach(cvcCourse => {
            const [ courseCode, courseName ] = cvcCourse.course.split(' - ');
            const specificSendingUniMap = targetUniMap[cvcCourse.college];
            if (specificSendingUniMap == undefined) return;
            let mapped = specificSendingUniMap[courseCode];
            if (mapped == undefined) return;
            const { articulatesTo, assistPath } = mapped;   
            if (articulatesTo.length == 0) return; 
            const fulfillsGEs = [...new Set(articulatesTo.flatMap(e => currUniObj.getCourseGeCategories(e)))];
            if (fulfillsGEs.length == 0) return; // If the course doesn't fulfill any GEs, don't add it 
            const { startMonth, startDay, endMonth, endDay } = parseDateRange(cvcCourse.term);
            const currCourse = {
                targetInstitution,
                sendingInstitution: cvcCourse.college,
                courseCode,
                courseName,
                cvcId: cvcCourse.cvcId,
                units: cvcCourse.units, 
                term: cvcCourse.term,
                startMonth,
                startDay,
                endMonth,
                endDay,
                tuition: cvcCourse.tuition,
                async: cvcCourse.async,
                hasOpenSeats: cvcCourse.hasOpenSeats,
                hasPrereqs: cvcCourse.hasPrereqs,
                instantEnrollment: cvcCourse.instantEnrollment,
                assistPath,
                articulatesTo,
                fulfillsGEs
            };
            fulfillsGEs.forEach(geCategory => {
                geMap[geCategory].push(currCourse);
            });
        });
        // Update the database 
        geCategories.forEach(geCategory => {
            const prismaJSON = {
                data: {
                    geCategory,
                    institution: targetInstitution,
                    courses: {
                        create: geMap[geCategory],
                    },
                }
            }
            writeGeCourses(prismaJSON);
        });
    }
}

main();
