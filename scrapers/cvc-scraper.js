import axios from "axios";
import cheerio from "cheerio";
import fs from "fs/promises";

let colleges = new Set(); // I'm just gonna put this here

const url = "https://search.cvc.edu/search";
const masterParams = {
    "filter[display_home_school]": false,
    "filter[search_all_universities]": true,
    "filter[search_type]": "subject_browsing",
    "filter[subject_id]": 98, 
    "commit": "Find Classes",
    "page": 1,
    "random_token": "",
    "filter[oei_phase_2_filter]": false,
    "filter[show_only_available]": false,
    "filter[delivery_methods][]": "online",
    "filter[delivery_method_subtypes][]": ["online_sync", "online_async"],
    "filter[prerequisites][]": ["", "has_prereqs", "no_prereqs"],
    "filter[session_names][]": ["Fall 2023", "Winter 2024", "Spring 2024"],
    "filter[zero_textbook_cost_filter]": false,
    "filter[start_date]": "2024-03-07", // will replace this hardcoded thingy later
    "filter[end_date]": "",
    "filter[target_school_ids][]": "",
    "filter[min_credits_range]": 0,
    "filter[max_credits_range]": 20,
    "filter[sort]": "oei",
};

async function safeFetch(url, params) {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await axios.get(url, { params });
        } catch (error) {
            //console.log(`Oopsie, there was a little trouble fetching! (${attempt + 3}/3)`)
        }
    }
    // If it fails we just don't return anything and let the main try catch block catch it
}

async function scrapeSingle(
    subject,
    subjectId,
    asyncOnly,
    openSeatsOnly,
    noPrereqsOnly,
    instantEnrollmentOnly,
) {
    let res = [];
    let currentScrapeSingleFoundCvcIds = new Set();
    // Set params
    let localParams = JSON.parse(JSON.stringify(masterParams));
    localParams.page = 1;
    localParams["filter[subject_id]"] = subjectId;
    if (asyncOnly) localParams["filter[delivery_method_subtypes][]"] = "online_async";
    if (openSeatsOnly) localParams["filter[show_only_available]"] = [false, true];
    if (noPrereqsOnly) localParams["filter[prerequisites][]"] = "no_prereqs";
    if (instantEnrollmentOnly) localParams["filter[oei_phase_2_filter]"] = [false, true];
    // Request
    let response = await safeFetch(url, localParams);
    let $ = cheerio.load(response.data);
    for (let i = 1; i <= 100; i++) {
        //process.stdout.write(`Page ${i}/${subjectTotalPages}\r`)
        if (i > 1) {
            localParams.page = i;
            response = await safeFetch(url, localParams);
            $ = cheerio.load(response.data);
        }
        let pageCourseCount = 0;
        $("#search-results > div:nth-child(n)")
            .slice(0, 10)
            .each(async (index, element) => {
                const e = $(element);
                if (!e.attr("class").startsWith("course")) return;
                pageCourseCount++;
                const college = e
                    .children()
                    .eq(0)
                    .children()
                    .eq(0)
                    .children()
                    .eq(0)
                    .text()
                    .trim();
                const courseName = e
                    .children()
                    .eq(0)
                    .children()
                    .eq(1)
                    .children()
                    .eq(0)
                    .text()
                    .trim();
                const cvcId = e
                    .children()
                    .eq(0)
                    .children()
                    .eq(1)
                    .children()
                    .eq(0)
                    .attr("href")
                    .split("?")[0]
                    .split("/")
                    .slice(-1)[0]
                    .trim();
                // Check if Nice to Haves are displayed
                const niceToHavesContainer = e.children().eq(1);
                const niceToHaves = niceToHavesContainer.hasClass(
                    "tags-container",
                )
                    ? niceToHavesContainer
                          .children()
                          .map((i, c) => $(c).text())
                          .get()
                    : [];

                const COURSE_INFO_MOBILE_INDEX = niceToHaves.length ? 2 : 1;
                const TUITION_INDEX = niceToHaves.length ? 3 : 2;

                const units = parseFloat(
                    e
                        .children()
                        .eq(COURSE_INFO_MOBILE_INDEX)
                        .children()
                        .eq(0)
                        .children()
                        .eq(0)
                        .children()
                        .eq(1)
                        .text()
                        .trim()
                        .split(" ")[0],
                );
                const term = e
                    .children()
                    .eq(COURSE_INFO_MOBILE_INDEX)
                    .children()
                    .eq(0)
                    .children()
                    .eq(1)
                    .children()
                    .eq(1)
                    .text()
                    .trim();
                const transferability = e
                    .children()
                    .eq(COURSE_INFO_MOBILE_INDEX)
                    .children()
                    .eq(0)
                    .children()
                    .eq(2)
                    .children()
                    .eq(1)
                    .children()
                    .map(function () {
                        return $(this).text().trim();
                    })
                    .get();
                const tuition = parseFloat(
                    e
                        .children()
                        .eq(TUITION_INDEX)
                        .children()
                        .eq(1)
                        .text()
                        .trim()
                        .split("$")[1]
                        .split(" ")[0],
                );
                let jsonObject = {
                    college: college,
                    course: courseName,
                    cvcId: cvcId,
                    niceToHaves: niceToHaves,
                    units: units,
                    term: term,
                    transferability: transferability,
                    tuition: tuition,
                };
                colleges.add(college);
                if (currentScrapeSingleFoundCvcIds.has(cvcId)) return;
                currentScrapeSingleFoundCvcIds.add(cvcId);
                res.push(jsonObject);
            });
        if (pageCourseCount < 10) break;
    }
    return res;
}

const fetchCvcData = async () => {
    let aggregateCourseData = [];
    try {
        // Clear data in output file (this will only be seen if the script stops early)
        fs.writeFile(
            "cvc-courses.json",
            "WARNING: BAD FORMAT, SCRIPT DID NOT FINISH EXECUTING PROPERLY\n",
            (err) => {},
        );

        let response = await safeFetch(url, masterParams);
        let $ = cheerio.load(response.data);

        const subjectMap = $("#filter_subject_id option")
            .toArray()
            .reduce((acc, element) => {
                const e = $(element);
                if (e.text() !== "Select a subject") acc[e.text()] = e.val();
                return acc;
            }, {});

        const subjectCount = Object.entries(subjectMap).length;
        console.log(`Found ${subjectCount} subjects`);

        let subjectIndex = 0;

        //Object.entries(subjectMap).forEach(async ([subject, subjectId]) => { // Don't use this it runs all of it at the same time
        for (const [subject, subjectId] of Object.entries(subjectMap)) {
            subjectIndex++;
            console.log(
                `[${subjectIndex}/${subjectCount}] Scraping courses for ${subject} (ID ${subjectId})`,
            );
            // No multithreading, don't spam cvc
            let all = await scrapeSingle(subject, subjectId, false, false, false, false);
            let asyncOnly = await scrapeSingle(subject, subjectId, true, false, false, false);
            let openSeatsOnly = await scrapeSingle(subject, subjectId, false, true, false, false);
            let noPrereqsOnly = await scrapeSingle(subject, subjectId, false, false, true, false);
            let instantEnrollmentOnly = await scrapeSingle(subject, subjectId, false, false, false, true);
            let allWithAttributes = all.map((e) => {
                e.async = !!asyncOnly.find((t) => t.college === e.college && t.course === e.course && t.term === e.term && t.cvcId === e.cvcId);
                e.hasOpenSeats = !!openSeatsOnly.find((t) => t.college === e.college && t.course === e.course && t.term === e.term && t.cvcId === e.cvcId);
                e.hasPrereqs = !noPrereqsOnly.find((t) => t.college === e.college && t.course === e.course && t.term === e.term && t.cvcId === e.cvcId);
                e.instantEnrollment = !!instantEnrollmentOnly.find((t) => t.college === e.college && t.course === e.course && t.term === e.term && t.cvcId === e.cvcId);
                return e;
            });
            aggregateCourseData = aggregateCourseData.concat(allWithAttributes);
            // failsafe data in case script crashes (or we just manually terminate it early) so the whole thing doesn't get discarded
            fs.appendFile("cvc-courses.json", allWithAttributes.map((e) => JSON.stringify(e)).join("\n") + "\n",
                (err) => {
                    // (pls don't change newline to comma at least for now)
                    if (err) {
                        console.error(err);
                    }
                },
            );
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    let courseDataJSON = {
        data: aggregateCourseData
    };
    // Overwrite failsafe data with properly formatted data
    fs.writeFile("cvc-courses.json", JSON.stringify(courseDataJSON), (err) => {
        if (err) {
            console.error(err);
        }
    });
    console.log(
        `Finished scraping CVC, found ${aggregateCourseData.length} courses!`,
    );
    colleges.forEach((c) => {
        console.log(c);
    });
    return courseDataJSON;
};

// Exports
export default fetchCvcData;

if ((process.argv[1].split("/").slice(-1)[0] = "cvc-scraper.js")) {
    // kind of a bad way of doing it but it works
    fetchCvcData();
}
