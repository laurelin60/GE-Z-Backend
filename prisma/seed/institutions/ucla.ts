import axios from "axios";
import * as cheerio from "cheerio";

import logger from "../../../src/util/logger";
import formatCode from "../util/format-code";
import { course, institution } from "../util/institution";

export default async function getUclaInstitution() {
    logger.info("Fetching UCLA");

    const name = "University of California, Los Angeles";
    const code = "UCLA";
    const geCategories = [
        "Arts and Humanities: Literary and Cultural Analysis",
        "Arts and Humanities: Philosophical and Linguistic Analysis",
        "Arts and Humanities: Visual and Performance Arts Analysis and Practice",
        "Scientific Inquiry: Life Sciences",
        "Scientific Inquiry: Physical Sciences",
        "Society and Culture: Historical Analysis",
        "Society and Culture: Social Analysis",
    ];
    const courses = await getUclaCourses();

    logger.info(`Found ${courses.length} UCLA courses`);

    return {
        name,
        code,
        geCategories,
        courses,
    } satisfies institution;
}

async function getUclaCourses(): Promise<course[]> {
    const departmentMap = await getDepartmentMap();
    const cookie = await getCookie();

    const baseUrl =
        "https://sa.ucla.edu/ro/Public/SOC/Search/SearchByFoundation";

    const queries = [
        "?input=%7B%22FoundationCode%22%3A%22AH%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Arts+and+Humanities",
        "?input=%7B%22FoundationCode%22%3A%22SI%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Scientific+Inquiry",
        "?input=%7B%22FoundationCode%22%3A%22SC%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Society+and+Culture",
    ];

    let courses: course[] = [];

    for (const query of queries) {
        const url: string = baseUrl + query;

        const response = await axios.get(url, {
            headers: { Cookie: cookie },
        });
        const html = response.data;
        const geCourses = scrapeHtml(html, departmentMap);

        if (geCourses.length === 0) {
            logger.warn("Failed to scrape courses for url: " + url);
            continue;
        }

        courses = courses.concat(geCourses);
    }
    return courses;
}

async function getDepartmentMap(): Promise<Record<string, string>> {
    const response = await axios.get(
        "https://api.ucla.edu/sis/publicapis/course/getallcourses",
    );
    if (response.status != 200) {
        throw new Error("Failed to get UCLA course category map");
    }

    const departmentMap: Record<string, string> = {};
    response.data.forEach((department) => {
        departmentMap[department.display_value.trim()] =
            department.subj_area_cd.trim();
    });
    return departmentMap;
}

function scrapeHtml(
    html: string,
    departmentMap: Record<string, string>,
): course[] {
    const $ = cheerio.load(html);
    const parentSet = new Set();

    const courses: course[] = [];

    $(".col-md-1").each((_index, element) => {
        const parent = $(element).parent();

        if (parentSet.has(parent)) {
            return;
        }
        parentSet.add(parent);

        const courseDepartment =
            departmentMap[parent.parents().eq(4).prev().text().trim()];
        if (courseDepartment === undefined) {
            Error();
        }

        const children = parent.children().toArray();
        const courseNumber = $(children[0]).text().trim();
        const courseName = $(children[1]).text().trim();
        const geCategories = $(children[children.length - 1])
            .text()
            .trim()
            .split("\n")
            .map((e) => e.trim());

        courses.push({
            courseCode: formatCode(courseDepartment + courseNumber),
            courseName,
            courseNumber,
            courseDepartment,
            geCategories,
        } satisfies course);
    });

    return courses;
}

async function getCookie(): Promise<string> {
    const response = await axios.get(
        "https://sa.ucla.edu/ro/Public/SOC/Search/GECoursesMasterList",
    );
    if (!response.headers["set-cookie"]) {
        throw new Error("Failed to get UCLA cookie");
    }
    return response.headers["set-cookie"].join("; ");
}
