import { Prisma } from "@prisma/client";
import { authed, ok, readPage, readRange } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip } = readPage(url);
    const { from, to } = readRange(url);
    const and: Prisma.AuditLogWhereInput[] = [{ createdAt: { gte: from, lte: to } }];
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action");
    const resourceType = url.searchParams.get("resourceType");
    if (userId) and.push({ userId });
    if (action) and.push({ action });
    if (resourceType) and.push({ resourceType });
    const where = { AND: and };
    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}
