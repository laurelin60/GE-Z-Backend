// import logger from "../src/util/logger";
//
// import { seedArticulations } from "./seed/articulations.seed";
// import { seedCvc } from "./seed/cvc.seed";
// import { seedInstitutions } from "./seed/institutions.seed";
//
// async function seedJson() {
//     await seedInstitutions("./institutions/institutions.json");
//     await seedCvc("./cvc/cvc.json");
//     await seedArticulations();
// }
//
// seedJson()
//     .catch((error) => {
//         logger.fatal(error);
//     })
//     .finally(() => {
//         logger.info("Seeding complete");
//     });
