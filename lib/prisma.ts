import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Neon env pull writes the pooled URL without Prisma's PgBouncer flag. */
function pooledUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("pgbouncer=") || !url.includes("-pooler")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: pooledUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
