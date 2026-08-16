import { PrismaClient } from '@prisma/client';
// Single Prisma client instance shared across the application.
// Avoids connection pool exhaustion from multiple instantiations.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=index.js.map