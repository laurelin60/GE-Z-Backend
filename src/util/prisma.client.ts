import { Prisma, PrismaClient } from "@prisma/client";
import { createPrismaRedisCache } from "prisma-redis-middleware";

import logger from "./logger";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const xprisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            process.env.NODE_ENV !== "production"
                ? ["info", "warn", "error"] // Add "query" to log queries
                : undefined,
    });

const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
    excludeModels: [
        "Institution",
        "GeCategory",
        "Course",
        // "CvcCourse", // <- CvcCourse queries are not excluded
        "Articulation",
    ],
    storage: {
        type: "memory",
        options: { size: 256, invalidation: true, log: logger },
    },
    cacheTime: 86_400, // 24 hours
    onError: (key) => {
        logger.error("cache error", key);
    },
});

// TODO: Update this to use client extension
xprisma.$use(cacheMiddleware);

xprisma.$connect();
