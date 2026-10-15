import { transitionStockTransfer } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

const include = {
  sourceWarehouse: true,
  destWarehouse: true,
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};

export async function GET(req: Request, ctx: Ctx) {
  return authed(req, async () => {
    const transfer = await prisma.stockTransfer.findUnique({ where: { id: (await ctx.params).id }, include });
    if (!transfer) return ok({ error: "Transfer not found." }, 404);
    return ok(transfer);
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return authed(req, async (user) => {
    const body = await readJson<{ action?: string }>(req);
    return ok(await transitionStockTransfer((await ctx.params).id, body.action || "", user.id));
  });
}
