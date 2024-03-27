import chalk from "chalk";

import UCI from "./uci.js";
import UCSB from "./ucsb.js";

class UniversityManager {
    static logInfo(message) {
        console.log(`[${chalk.cyan("UniMan")}] ${message}`);
    }

    static async addUniversity(uni) {
        await uni.initialize();
        if (uni.valid)
            UniversityManager.logInfo(`Successfully initialized ${uni.name}`);
        else
            UniversityManager.logInfo(
                chalk.redBright(`Failed to initialize ${uni.name}!`),
            );
        UniversityManager.universities.push(uni);
    }

    static async initialize() {
        if (UniversityManager.initialized) return;
        if (UniversityManager.initializing) {
            while (UniversityManager.initializing) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        UniversityManager.initializing = true;
        UniversityManager.logInfo("Initializing...");
        UniversityManager.universities = [];

        await UniversityManager.addUniversity(new UCI());
        await UniversityManager.addUniversity(new UCSB());

        UniversityManager.logInfo("Initialized!");
        UniversityManager.initialized = true;
        UniversityManager.initializing = false;
    }

    static async reset() {
        UniversityManager.logInfo("Resetting");
        UniversityManager.universities = [];
        UniversityManager.initialized = false;
        UniversityManager.initializing = false;
        await UniversityManager.initialize();
    }

    static getUniversity(name) {
        return UniversityManager.universities.find((uni) => uni.name == name);
    }
}

export default UniversityManager;
