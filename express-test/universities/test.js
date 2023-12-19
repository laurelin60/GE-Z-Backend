import UniversityManager from './university-manager.js';

async function main() {
    await UniversityManager.initialize();
    const uci = UniversityManager.getUniversity('University of California, Irvine');
    console.log(uci.getCourseGeCategories('INTL ST 1'));
    const ucsb = UniversityManager.getUniversity('University of California, Santa Barbara');
    console.log(ucsb.getCourseGeCategories('EARTH 8'));
}

main();