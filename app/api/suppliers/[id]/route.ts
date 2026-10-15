import { deleteSupplier, updateSupplier } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  return authed(req, async () => {
    const { id } = await ctx.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: { orderBy: { orderDate: "desc" }, take: 8, include: { warehouse: true } },
        products: {
          where: { status: "ACTIVE" },
          take: 12,
          select: { id: true, name: true, sku: true, sellingPrice: true, costPrice: true },
        },
      },
    });
    if (!supplier) return ok({ error: "Supplier not found." }, 404);
    return ok(supplier);
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return authed(req, async (user) => ok(await updateSupplier((await ctx.params).id, await readJson(req), user.id)));
}

export async function DELETE(req: Request, ctx: Ctx) {
  return authed(req, async (user) => ok(await deleteSupplier((await ctx.params).id, user.id)));
}
