// server.js
import express from 'express';
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
    const ge = req.query.ge;
    const uni = req.query.uni;
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});