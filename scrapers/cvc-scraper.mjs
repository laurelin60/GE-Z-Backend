import axios from "axios";
import cheerio from "cheerio";
import fs from "fs/promises";

let colleges = new Set(); // I'm just gonna put this here

const url = "https://search.cvc.edu/search";
const masterParams = {
    "filter[display_home_school]": false,
    "filter[search_all_universities]": true,
    "filter[search_type]": "open_search",
    "filter[subject]": "*",
    commit: "Find Classes",
    page: 1,
    random_token: "",
    "filter[oei_phase_2_filter]": false,
    "filter[show_only_available]": false,
    "filter[delivery_methods][]": "online",
    "filter[delivery_method_subtypes][]": ["online_sync", "online_async"],
    "filter[prerequisites][]": ["", "has_prereqs", "no_prereqs"],
    "filter[session_names][]": ["Summer 2025", "Fall 2025"],
    "filter[zero_textbook_cost_filter]": false,
    "filter[start_date]": new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
    )
        .toISOString()
        .split("T")[0], // 2 days ago (30 is a bit much - too many results and we hit the 10k limit. I might change this to just the current date)
    "filter[end_date]": "",
    "filter[target_school_ids][]": "",
    "filter[min_credits_range]": 0.1, // used to be 0 but this shit would take way too long with all those extras and you probably don't want those anyway
    "filter[max_credits_range]": 20,

    // IMPORTANT: sorting seems to not exist in the UI as of 2/15/2025 but I'm keeping it anyway
    "filter[sort]": "distance", // this seems to be the only one cvc didn't break (whew, if it was I would need to find a workaround that would likely make scraping way slower)
    // default "oei" sort is broken on cvc as of 9/30/2024 (duplicate entries listed, with some courses excluded) - I checked manually
    // chronological "startdate" sort is broken on cvc as of 11/26/2024 (duplicate entries listed, with some courses excluded) - I checked manually
    // alphabetical "alpha_asc" sort is broken on cvc as of 11/26/2024 (duplicate entries listed, with some courses MAYBE excluded, didn't 100% check) - I checked manually
    // not sure how cvc managed to break this and not notice but I'm still glad it's here as a resource
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
    if (asyncOnly)
        localParams["filter[delivery_method_subtypes][]"] = "online_async";
    if (openSeatsOnly)
        localParams["filter[show_only_available]"] = [false, true];
    if (noPrereqsOnly) localParams["filter[prerequisites][]"] = "no_prereqs";
    if (instantEnrollmentOnly)
        localParams["filter[oei_phase_2_filter]"] = [false, true];
    // Request
    let response = await safeFetch(url, localParams);
    let $ = cheerio.load(response.data);
    let totalPages = $(".page:not(.next)").last().text();
    for (let i = 1; i <= totalPages; i++) { // cap at 1k pages (so 10k courses)
        process.stdout.write(`Page ${i}/${totalPages}\r`)
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
                let tuition = parseFloat(
                    e
                        .children()
                        .eq(TUITION_INDEX)
                        .children()
                        .eq(1)
                        .text()
                        .trim()
                        .split("$")[1]
                        ?.split(" ")[0],
                );
                if (isNaN(tuition)) tuition = 0;
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
        await fs.writeFile(
            "./scrapers/cvc-courses.json",
            "WARNING: BAD FORMAT, SCRIPT DID NOT FINISH EXECUTING PROPERLY\n",
            (_err) => {},
        );

        let response = await safeFetch(url, masterParams); // redundant fetch but im too lazy to change it
        let $ = cheerio.load(response.data);

        console.log(`Found ${$(".text-black").text().split(' ')[0]} total courses`);

        // No multithreading, don't spam cvc
        console.log("Scraping all courses");
        let all = await scrapeSingle(
            false,
            false,
            false,
            false,
        );

        console.log("Scraping async courses");
        let asyncOnly = await scrapeSingle(
            true,
            false,
            false,
            false,
        );

        console.log("Scraping open seats only");
        let openSeatsOnly = await scrapeSingle(
            false,
            true,
            false,
            false,
        );

        console.log("Scraping no prereqs only");
        let noPrereqsOnly = await scrapeSingle(
            false,
            false,
            true,
            false,
        );

        console.log("Scraping instant enrollment only");
        let instantEnrollmentOnly = await scrapeSingle(
            false,
            false,
            false,
            true,
        );
        let allWithAttributes = all.map((e) => {
            e.async = !!asyncOnly.find(
                (t) =>
                    t.college === e.college &&
                    t.course === e.course &&
                    t.term === e.term &&
                    t.cvcId === e.cvcId,
            );
            e.hasOpenSeats = !!openSeatsOnly.find(
                (t) =>
                    t.college === e.college &&
                    t.course === e.course &&
                    t.term === e.term &&
                    t.cvcId === e.cvcId,
            );
            e.hasPrereqs = !noPrereqsOnly.find(
                (t) =>
                    t.college === e.college &&
                    t.course === e.course &&
                    t.term === e.term &&
                    t.cvcId === e.cvcId,
            );
            e.instantEnrollment = !!instantEnrollmentOnly.find(
                (t) =>
                    t.college === e.college &&
                    t.course === e.course &&
                    t.term === e.term &&
                    t.cvcId === e.cvcId,
            );
            return e;
        });
        aggregateCourseData = aggregateCourseData.concat(allWithAttributes);
        // failsafe data in case script crashes (or we just manually terminate it early) so the whole thing doesn't get discarded
        await fs.appendFile(
            "./scrapers/cvc-courses.json",
            allWithAttributes.map((e) => JSON.stringify(e)).join("\n") +
                "\n",
            (err) => {
                // (pls don't change newline to comma at least for now)
                if (err) {
                    console.error(err);
                }
            },
        );

    } catch (error) {
        console.error("Error fetching data:", error);
    }
    let courseDataJSON = {
        data: aggregateCourseData,
        updatedAt: Date.now(),
    };
    // Overwrite failsafe data with properly formatted data
    await fs.writeFile(
        "./scrapers/cvc-courses.json",
        JSON.stringify(courseDataJSON),
        (err) => {
            if (err) {
                console.error(err);
            }
        },
    );
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

// if ((process.argv[1].split("/").slice(-1)[0] = "cvc-scraper.mjs")) {
//     // kind of a bad way of doing it but it works
//     fetchCvcData();
// }
