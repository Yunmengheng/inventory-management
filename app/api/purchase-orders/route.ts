import { Prisma } from "@prisma/client";
import { createPurchaseOrder } from "@/lib/domain";
import { authed, ok, readJson, readPage, textSearch } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip, search } = readPage(url);
    const and: Prisma.PurchaseOrderWhereInput[] = [];
    const status = url.searchParams.get("status");
    const supplierId = url.searchParams.get("supplierId");
    const warehouseId = url.searchParams.get("warehouseId");
    if (status) and.push({ status });
    if (supplierId) and.push({ supplierId });
    if (warehouseId) and.push({ warehouseId });
    if (search) and.push({ orderNumber: textSearch(search) });
    const where = and.length ? { AND: and } : {};
    const [total, data] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, warehouse: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}

export async function POST(req: Request) {
  return authed(req, async (user) => ok(await createPurchaseOrder(await readJson(req), user.id), 201));
}
