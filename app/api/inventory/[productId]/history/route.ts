import { authed, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ productId: string }> }) {
  return authed(req, async () => {
    const { productId } = await ctx.params;
    const warehouseId = new URL(req.url).searchParams.get("warehouseId") || "";
    const data = await prisma.inventoryTransaction.findMany({
      where: { productId, ...(warehouseId ? { warehouseId } : {}) },
      include: { warehouse: true, product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    return ok({ data });
  });
}
