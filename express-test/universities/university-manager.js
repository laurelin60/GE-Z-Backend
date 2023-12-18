import chalk from 'chalk';

import UCI from './UCI.js';


class UniversityManager {
    constructor() {
        if (!UniversityManager.universities) {
            UniversityManager.universities = [];
        }
    }

    logInfo(message) {
        console.log(`[${chalk.cyan('UniMan')}] ${message}`);
    }

    async addUniversity(uni) {
        await uni.initialize();
        if (uni.valid) this.logInfo(`Successfully initialized ${uni.name}`);
        else this.logInfo(chalk.redBright(`Failed to initialize ${uni.name}!`));
        UniversityManager.universities.push(uni);
    }

    async initialize() {
        if (this.initialized) return;
        if (this.initializing) {
            while (this.initializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        this.initializing = true;
        this.logInfo('Initializing...')
        await this.addUniversity(new UCI());
        this.logInfo('Initialized!');
        this.initialized = true;
        this.initializing = false;
    }

    async reset() {
        this.logInfo('Resetting');
        UniversityManager.universities = [];
        this.initialized = false;
        this.initializing = false;
        await this.initialize();
    }

    getUniversity(name) {
        return UniversityManager.universities.find(uni => uni.name == name);
    }
}

export default UniversityManager;
