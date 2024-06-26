import axios from "axios";
import cheerio from "cheerio";

import University from "./university";

class UCLA extends University {
    dcs: Set<string>; // String representation of courses to prevent duplicates

    constructor() {
        super();
        this.name = "University of California, Los Angeles";
        this.valid = false;
        this.geMap = {};
        this.dcs = new Set();
    }

    async fetchAndAddCourses(
        paramString: string,
        catMap: Record<string, string>,
        cookie: string,
    ) {
        const baseUrl: string =
            "https://sa.ucla.edu/ro/Public/SOC/Search/SearchByFoundation";
        const url: string = baseUrl + paramString;
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
        const $ = cheerio.load(html);
        const s = new Set();

        $(".col-md-1").each((index, element) => {
            const parent = $(element).parent();
            if (s.has(parent)) return;
            s.add(parent);
            const children = parent.children().toArray();
            const categoryCode =
                catMap[parent.parents().eq(4).prev().text().trim()];
            if (categoryCode === undefined) {
                console.log(
                    `WARNING: category code not found for UCLA category "${parent
                        .parents()
                        .eq(4)
                        .prev()
                        .text()
                        .trim()}"`,
                );
                return;
            }
            const catalogNum = $(children[0]).text().trim();
            const geCats = $(children[children.length - 1])
                .text()
                .trim()
                .split("\n")
                .map((e) => e.trim());
            const strrep = `${categoryCode} ${catalogNum} (${geCats.join(
                ", ",
            )})`;
            if (this.dcs.has(strrep)) return;
            this.dcs.add(strrep);
            this.geMap[`${categoryCode}${catalogNum}`.replaceAll(" ", "")] =
                geCats;
        });
    }

    async getCookie(): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await axios.get(
            "https://sa.ucla.edu/ro/Public/SOC/Search/GECoursesMasterList",
        );
        return response.headers["set-cookie"].join("; ");
    }

    async initialize() {
        // Initialize map of course category names to category codes
        const catMapUrl =
            "https://api.ucla.edu/sis/publicapis/course/getallcourses";
        const catMapResponse = await axios.get(catMapUrl);
        const catMap: Record<string, string> = {};
        if (catMapResponse.status == 200) {
            const courseArray = catMapResponse.data;
            courseArray.forEach((e) => {
                catMap[e.display_value.trim()] = e.subj_area_cd.trim();
            });
            const cookie = await this.getCookie();
            await this.fetchAndAddCourses(
                '?input={"FoundationCode"%3A"AH"%2C"SubjectArea"%3A"%"%2C"LabDemoFilter"%3Afalse%2C"WritingTwoFilter"%3Afalse%2C"MultiCategoryFilter"%3Afalse%2C"DiversityFilter"%3Afalse}&search_criteria=Foundations+of+Arts+and+Humanities',
                catMap,
                cookie,
            );
            await this.fetchAndAddCourses(
                '?input={"FoundationCode"%3A"SI"%2C"SubjectArea"%3A"%"%2C"LabDemoFilter"%3Afalse%2C"WritingTwoFilter"%3Afalse%2C"MultiCategoryFilter"%3Afalse%2C"DiversityFilter"%3Afalse}&search_criteria=Foundations+of+Scientific+Inquiry',
                catMap,
                cookie,
            );
            await this.fetchAndAddCourses(
                '?input={"FoundationCode"%3A"SC"%2C"SubjectArea"%3A"%"%2C"LabDemoFilter"%3Afalse%2C"WritingTwoFilter"%3Afalse%2C"MultiCategoryFilter"%3Afalse%2C"DiversityFilter"%3Afalse}&search_criteria=Foundations+of+Society+and+Culture',
                catMap,
                cookie,
            );
            this.valid = true;
        }
    }

    getGeCategories() {
        return [
            "Arts and Humanities: Literary and Cultural Analysis",
            "Arts and Humanities: Philosophical and Linguistic Analysis",
            "Arts and Humanities: Visual and Performance Arts Analysis and Practice",
            "Scientific Inquiry: Life Sciences",
            "Scientific Inquiry: Physical Sciences",
            "Society and Culture: Historical Analysis",
            "Society and Culture: Social Analysis",
        ];
    }

    getCourseGeCategories(courseCode) {
        return this.geMap[courseCode.replaceAll(" ", "")] || [];
    }
}

export default UCLA;
