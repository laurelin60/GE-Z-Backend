class University {
    name: string;
    valid: boolean;
    geMap: Record<string, string[]>;

    constructor() {
        this.name = "DEFAULT UNIVERSITY (if you're seeing this printed in the program something has gone very wrong)";
        this.valid = false
        this.geMap = {};
    }

    // Returns an array of valid GE categories
    getGeCategories() { 
        throw new Error('getGEs method must be implemented');
    }

    getCourseGeCategories(courseCode) {
        return this.geMap[courseCode] || [];
    }
}
  
export default University;