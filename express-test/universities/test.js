import UniversityManager from './university-manager.js';

async function main() {
    const manager = new UniversityManager();
    await manager.initialize();
    const uci = manager.getUniversity('University of California, Irvine');
    console.log(uci.getCourseGeCategories('INTLST1'));
}

main();