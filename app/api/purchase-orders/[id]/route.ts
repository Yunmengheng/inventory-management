import { transitionPurchaseOrder } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

const include = {
  supplier: true,
  warehouse: true,
  items: { include: { product: { select: { id: true, name: true, sku: true } } } },
};

export async function GET(req: Request, ctx: Ctx) {
  return authed(req, async () => {
    const order = await prisma.purchaseOrder.findUnique({ where: { id: (await ctx.params).id }, include });
    if (!order) return ok({ error: "Purchase order not found." }, 404);
    return ok(order);
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return authed(req, async (user) => {
    const body = await readJson<{ action?: string; lines?: { id?: string; quantity?: number }[] }>(req);
    return ok(await transitionPurchaseOrder((await ctx.params).id, body.action || "", body.lines, user.id));
  });
}
