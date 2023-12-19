import University from './University.js';
import axios from 'axios';


class UCSB extends University {
    constructor() {
        super();
        this.name = "University of California, Santa Barbara";
        this.valid = false;
        this.geMap = {};
    }

    async initialize() {
        // Initialize course GE categories (from their CourseDog API) (UI at https://catalog.ucsb.edu/courses)
        const url = "https://app.coursedog.com/api/v1/cm/ucsb/courses/search/%24filters?skip=0&limit=1000000000&columns=customFields.generalSubjectAreas%2Ccode";
        const response = await axios.get(url);

        if (response.status == 200) {
            const courseArray = response.data.data;
            courseArray.forEach(element => {
                const courseId = element.code;
                const geList = element.customFields.generalSubjectAreas;
                this.geMap[courseId] = geList;
            });
            if (Object.keys(this.geMap).length > 0) this.valid = true;
        }
    }

    getGeCategories() { 
        return [ 'A1', 'A2', 'B', 'C', 'D', 'E', 'F', 'G' ];
    }

    getCourseGeCategories(courseCode) {
        return this.geMap[courseCode] || [];
    }
}

export default UCSB;
