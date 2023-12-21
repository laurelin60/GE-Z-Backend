import University from './university.js';
import axios from 'axios';


class UCI extends University {
    constructor() {
        super();
        this.name = "University of California, Irvine";
        this.valid = false;
        this.geMap = {};
    }

    async initialize() {
        // Initialize course GE categories (from PeterPortal) 
        const url = "https://api-next.peterportal.org/v1/graphql";
        const headers = {
            'Content-Type': 'application/json',
        };
        const data = {
            // Query from the peterportal demo thingy 
            query: `
                query ExampleQuery {
                    allCourses {
                        id
                        geList
                    }
                }`
        };

        const response = await axios.post(url, data, { headers });

        if (response.status == 200) {
            const courseArray = response.data.data.allCourses;
            courseArray.forEach(element => {
                const courseId = element.id;
                const geList = element.geList || [];
        
                // Extract the raw GE categories from geList in json and update the map
                const geInfoArray = geList.map(ge => {
                    const match = ge.match(/GE (.+?):/);
                    return (match && match.length > 1) ? match[1].trim() : null;
                }).filter(Boolean); // Filter out null values
        
                this.geMap[courseId] = geInfoArray;
            });
            if (Object.keys(this.geMap).length > 0) this.valid = true;
        }
    }

    getGeCategories() { 
        return [ 'Ia', 'Ib', 'II', 'III', 'IV', 'Va', 'Vb', 'VI', 'VII', 'VIII' ];
    }

    getCourseGeCategories(courseCode) {
        return this.geMap[courseCode.replaceAll(' ', '')] || [];
    }
}

export default UCI;
