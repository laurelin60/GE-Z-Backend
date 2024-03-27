import UniversityManager from './university-manager';

async function main() {
    await UniversityManager.initialize();
    const uci: any = UniversityManager.getUniversity('University of California, Irvine');
    console.log(uci.getCourseGeCategories('INTL ST 1'));
    const ucsb: any = UniversityManager.getUniversity('University of California, Santa Barbara');
    console.log(ucsb.getCourseGeCategories('EARTH 8'));
    const ucla: any = UniversityManager.getUniversity('University of California, Los Angeles');
    console.log(ucla.getCourseGeCategories('AF AMER M5'));
}

main();