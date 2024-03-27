import { createManyArticulations, agreement } from "./util/articulation";
import { createManyCvcCourses, cvcCourse } from "./util/cvc";
import { createManyInstitutions, institution } from "./util/institution";

const sampleInstitutions = [
    {
        name: "University of California, Irvine",
        code: "UCI",
        geCategories: ["I", "II"],
        courses: [
            {
                courseCode: "ICS 33",
                courseName: "Introduction to Computer Science",
                courseNumber: "33",
                courseDepartment: "ICS",
                geCategories: ["I"],
            },
        ],
    },
    {
        name: "University of California, Santa Barbara",
        code: "UCSB",
        geCategories: ["A1", "A2"],
        courses: [
            {
                courseCode: "ANTH 2",
                courseName: "Introduction to Anthropology",
                courseNumber: "2",
                courseDepartment: "ANTH",
                geCategories: ["A1"],
            },
        ],
    },
] satisfies institution[];

const sampleCvcCourses = [
    {
        college: "Monterey Peninsula College",
        courseCode: "MPCANTH2",
        courseName: "Introduction to Anthropology",
        cvcId: "123cvcid",
        niceToHaves: ["Nice1", "Nice2"],
        units: 4,
        startDate: new Date("2021-09-01"),
        endDate: new Date("2021-12-01"),
        async: false,
        hasOpenSeats: true,
        hasPrereqs: true,
        instantEnrollment: true,
        tuition: 180,
    },
] satisfies cvcCourse[];

const sampleArticulations = [
    {
        fromCollege: "Monterey Peninsula College",
        toInstitutionCode: "UCSB",
        assistPath: "www.assist.org?from=mpc&to=ucsb",
        articulations: [
            {
                fromCvcCoursesCodes: ["MPCANTH 2"],
                toCoursesCodes: ["ANTH 2"],
            },
        ],
    },
] satisfies agreement[];

async function exampleSeed() {
    await createManyInstitutions(sampleInstitutions);
    await createManyCvcCourses(sampleCvcCourses);
    await createManyArticulations(sampleArticulations);
}

exampleSeed().then(() => {});
