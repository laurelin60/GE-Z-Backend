import UniversityManager from './university-manager.js';

async function main() {
    const manager = new UniversityManager();
    await manager.initialize();
    const uci = manager.getUniversity('University of California, Irvine');
    console.log(uci.getCourseGeCategories('INTL ST 1'));
    const ucsb = manager.getUniversity('University of California, Santa Barbara');
    console.log(ucsb.getCourseGeCategories('EARTH 8'));
}

main();