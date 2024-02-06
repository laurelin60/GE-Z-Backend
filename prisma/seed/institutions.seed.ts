import fs from "fs";
import path from "path";

import { z } from "zod";

import logger from "../../src/util/logger";
import { xprisma } from "../../src/util/prisma.client";

const institutionsSchema = z.array(
    z.object({
        name: z.string(),
        code: z.string(),
        geCategories: z.array(z.string()),
    }),
);

const coursesSchema = z.array(
    z.object({
        code: z.string(),
        department: z.string(),
        number: z.string(),
        ge_list: z.array(z.string()),
    }),
);

export async function seedInstitutions(seedFilePath: string) {
    logger.info("Seeding Institutions");

    const institutionsData = fs.readFileSync(
        path.resolve(__dirname, seedFilePath),
        "utf-8",
    );

    const institutions = institutionsSchema.parse(JSON.parse(institutionsData));

    for (const institution of institutions) {
        const institutionCreated = await xprisma.institution.create({
            data: {
                name: institution.name,
                code: institution.code,
                geCategories: {
                    create: institution.geCategories.map((category) => ({
                        category,
                    })),
                },
            },
            include: {
                geCategories: true,
            },
        });

        const geIds: Record<string, number> = {};
        institutionCreated.geCategories.forEach((category) => {
            geIds[category.category] = category.id;
        });

        // REPLACE
        const courseData = fs.readFileSync(
            path.resolve(
                __dirname,
                `./institutions/${institution.code}/${institution.code}.courses.reformat.json`,
            ),
            "utf-8",
        );
        //

        const courses = coursesSchema.parse(JSON.parse(courseData));

        for (const course of courses) {
            await xprisma.course.create({
                data: {
                    courseCode: course.code,
                    courseDepartment: course.department,
                    courseNumber: course.number,
                    institution: {
                        connect: {
                            name: institution.name,
                            code: institution.code,
                        },
                    },
                    geCategories: {
                        connect: course.ge_list.map((category) => ({
                            id: geIds[category],
                        })),
                    },
                },
            });
        }
    }

    const added = await xprisma.institution.findMany();
    logger.info(`Seeded ${added.length} Institutions`);
}
