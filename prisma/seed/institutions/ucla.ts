import axios from "axios";
import * as cheerio from "cheerio";

import logger from "../../../src/util/logger";
import formatCode from "../util/format-code";
import { courseType, institutionType } from "../util/institution";

import Institution from "./institution";

export default class Ucla extends Institution {
    constructor() {
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

        super(name, code, geCategories);
    }

    public async getInstitution(): Promise<institutionType> {
        const courses = await getUclaCourses();

        return {
            name: this.name,
            code: this.code,
            geCategories: this.geCategories,
            courses,
        };
    }
}

async function getUclaCourses(): Promise<courseType[]> {
    const departmentMap = await getDepartmentMap();
    const cookie = await getCookie();

    const baseUrl =
        "https://sa.ucla.edu/ro/Public/SOC/Search/SearchByFoundation";

    const queries = [
        "?input=%7B%22FoundationCode%22%3A%22AH%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Arts+and+Humanities",
        "?input=%7B%22FoundationCode%22%3A%22SI%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Scientific+Inquiry",
        "?input=%7B%22FoundationCode%22%3A%22SC%22%2C%22SubjectArea%22%3A%22%25%22%2C%22LabDemoFilter%22%3Afalse%2C%22WritingTwoFilter%22%3Afalse%2C%22MultiCategoryFilter%22%3Afalse%2C%22DiversityFilter%22%3Afalse%7D&search_criteria=Foundations+of+Society+and+Culture",
    ];

    let courses: courseType[] = [];

    for (const query of queries) {
        const url: string = baseUrl + query;

        const response = await axios.get(url, {
            headers: {
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                Connection: "keep-alive",
                Host: "sa.ucla.edu",
                Referer:
                    "https://sa.ucla.edu/ro/Public/SOC/Search/GECoursesMasterList",
                "Sec-Ch-Ua": `"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"`,
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": `"Windows"`,
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest",
                Cookie: cookie,
            },
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
    response.data.forEach(
        (department: { display_value: string; subj_area_cd: string }) => {
            departmentMap[department.display_value.trim()] =
                department.subj_area_cd.trim();
        },
    );
    return departmentMap;
}

function scrapeHtml(
    html: string,
    departmentMap: Record<string, string>,
): courseType[] {
    const $ = cheerio.load(html);
    const parentSet = new Set();

    const courses: courseType[] = [];

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
        } satisfies courseType);
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
