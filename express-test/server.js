// server.js
import express from 'express';
import https from 'https';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.get('/', (req, res) => {
    res.send(':)');
});

app.get('/api/', (req, res) => {
    res.send('insane api thingy');
});

app.get('/api/cvc-courses', async (req, res) => {
    // Get current time in ms
    const startTime = Date.now();
    const ge = decodeURIComponent(req.query.ge);
    const uni = decodeURIComponent(req.query.uni);
    if (!ge || !uni) {
        return res.status(400).json({
            error: `Missing required query parameters: ` + (ge ? '' : 'ge, ') + (uni ? '' : 'uni'),
        });
    }
    try {
        // Check if the specified GECourseList exists
        const geCourseList = await prisma.geCourseList.findUnique({
            where: {
                unique_geCategory_institution: {
                    geCategory: ge,
                    institution: uni, 
                },
            },
            include: {
                courses: true,
            },
        });

        if (!geCourseList) {
            return res.status(404).json({
                error: `GECourseList with geCategory '${ge}' not found at institution '${uni}'`,
            });
        }

        const courses = geCourseList.courses;
        res.json({
            institution: uni,
            geCategory: ge,
            courses: courses.map(course => {
                const { id, targetInstitution, geCourseListId, ...rest } = course;
                return rest;
            }),
        });
          
        
        const elapsedTime = Date.now() - startTime;
        console.log(`[${req.ip}] GET /api/cvc-courses?ge=${ge}&uni=${uni} (${elapsedTime}ms)`);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/test', async (req, res) => {
    // Get current time in ms
    const startTime = Date.now();
    const course = decodeURIComponent(req.query.course);
    const uni = decodeURIComponent(req.query.uni);
    if (!course || !uni) {
        return res.status(400).json({
            error: `Missing required query parameters: ` + (course ? '' : 'course, ') + (uni ? '' : 'uni'),
        });
    }
    try {
        // Check if the specified GECourseList exists
        const courses = await prisma.cvcCourse.findMany({
            where: {
                targetInstitution: uni,
                articulatesTo: {
                    has: course
                }
            }
        });

        if (!courses) {
            return res.status(404).json({
                error: `Course ${course}' not found at institution '${uni}'`,
            });
        }

        res.json({
            institution: uni,
            course,
            courses: courses.map(course => {
                const { id, targetInstitution, geCourseListId, ...rest } = course;
                return rest;
            }),
        });
          
        
        const elapsedTime = Date.now() - startTime;
        console.log(`[${req.ip}] GET /api/test?course=${course}&uni=${uni} (${elapsedTime}ms)`);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function main() {
    console.log('Starting server...')
    if (process.argv.includes('-ssl')) {
        https.createServer({
            key: await fs.readFile('ssl/private.key'),
            cert: await fs.readFile('ssl/certificate.crt')
        }, app).listen(5000);
        console.log('Server is running on port 5000 with SSL');
    }
    else {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    }
}

main();