import { Prisma } from "@prisma/client";
import { createStockTransfer } from "@/lib/domain";
import { authed, ok, readJson, readPage, textSearch } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip, search } = readPage(url);
    const and: Prisma.StockTransferWhereInput[] = [];
    const status = url.searchParams.get("status");
    const warehouseId = url.searchParams.get("warehouseId");
    if (status) and.push({ status });
    if (warehouseId) and.push({ OR: [{ sourceWarehouseId: warehouseId }, { destWarehouseId: warehouseId }] });
    if (search) and.push({ transferNumber: textSearch(search) });
    const where = and.length ? { AND: and } : {};
    const [total, data] = await Promise.all([
      prisma.stockTransfer.count({ where }),
      prisma.stockTransfer.findMany({
        where,
        include: { sourceWarehouse: true, destWarehouse: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}

export async function POST(req: Request) {
  return authed(req, async (user) => ok(await createStockTransfer(await readJson(req), user.id), 201));
}
