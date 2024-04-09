import UniversityManager from "./university-manager";

async function main() {
    await UniversityManager.initialize();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uci: any = UniversityManager.getUniversity(
        "University of California, Irvine",
    );
    console.log(uci.getCourseGeCategories("INTL ST 1"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ucsb: any = UniversityManager.getUniversity(
        "University of California, Santa Barbara",
    );
    console.log(ucsb.getCourseGeCategories("EARTH 8"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ucla: any = UniversityManager.getUniversity(
        "University of California, Los Angeles",
    );
    console.log(ucla.getCourseGeCategories("AF AMER M5"));
}

main();
