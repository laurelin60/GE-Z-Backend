import axios from 'axios';
import fs from 'fs/promises';

async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
}

function sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_'); // Avoid invaid file names 
}

async function fetchInstitutions(targetInstitutionId) {
    const url = `https://assist.org/api/institutions/${targetInstitutionId}/agreements`;
    const institutions = await fetchData(url);

    return institutions
        .filter(({ isCommunityCollege }) => isCommunityCollege)
        .map(({ institutionParentId, institutionName }) => ({ id: institutionParentId, name: sanitizeFileName(institutionName) }));
}

async function fetchAcademicYears() {
    const url = 'https://assist.org/api/AcademicYears';
    const academicYears = await fetchData(url);
    const academicYearMap = {};
    academicYears.forEach(({ FallYear, Id }) => {
        academicYearMap[FallYear] = Id;
    });
    return academicYearMap;
}

async function fetchAgreements(targetInstitutionId, sendingInstitutionId, academicYearId, sendingInstitutionName) {
    const url = `https://assist.org/api/agreements?receivingInstitutionId=${targetInstitutionId}&sendingInstitutionId=${sendingInstitutionId}&academicYearId=${academicYearId}&categoryCode=major`;
    const agreementsData = await fetchData(url);
    const agreementsMap = {};

    // Grab all the PDFs for this college at the same time 
    await Promise.all(agreementsData.reports.map(async (report) => {
        const { label, key } = report;
        agreementsMap[sanitizeFileName(label)] = key;

        // Fetch and save the current PDF
        const pdfUrl = `https://assist.org/api/artifacts/${key}`; // Accessing this link in a browser instadownloads the PDF. For "previews" go to https://assist.org/transfer/report/${key} 
        const pdfData = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        const fileName = sanitizeFileName(label) + "---" + key.toString(); // Make sure to add the key (PDF ID) so the PDF parser can provide ID 
        const filePath = `./output/${sendingInstitutionName}/${fileName}.pdf`;

        // Create output dir if needed
        await fs.mkdir(`./output/${sendingInstitutionName}`, { recursive: true });

        await fs.writeFile(filePath, pdfData.data, 'binary');
    }));

    return agreementsMap;
}

async function runScript() {
    try {
        const targetInstitutionId = 120; // UCI 
        const targetYear = 2022; // Not all schools have 2023 articultions rn, they should pretty much match up anyway 
        const institutions = await fetchInstitutions(targetInstitutionId);
        console.log('Institutions:', institutions);

        const academicYears = await fetchAcademicYears();
        console.log('Academic Years:', academicYears);

        const academicYearId = academicYears[targetYear];
        if (academicYearId == 0) {
            console.log("Invalid academic year!");
            return;
        }

        // Loop through each institution and fetch agreements
        for (const sendingInstitution of institutions) {
            const { id, name } = sendingInstitution;

            // Skip fetching agreements for the target institution (UCI) 
            if (id !== targetInstitutionId) {
                console.log(`Fetching agreements for ${name} (ID: ${id})`);
                const agreements = await fetchAgreements(targetInstitutionId, id, academicYearId, name);
                console.log(`Agreements for ${name}:`, agreements);
                await new Promise(t => setTimeout(t, 7000)); // Delay so we don't spam too many requests 
            }
        }
    } 
    catch (error) {
        console.error('Script failed:', error.message);
    }
}

runScript();
