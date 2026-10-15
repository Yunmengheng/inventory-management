import { deleteProduct, updateProduct } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  return authed(req, async () => {
    const { id } = await ctx.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true, inventory: { include: { warehouse: true } } },
    });
    if (!product) return ok({ error: "Product not found." }, 404);
    return ok(product);
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return authed(req, async (user) => {
    const { id } = await ctx.params;
    const body = await readJson<Record<string, unknown>>(req);
    return ok(await updateProduct(id, body, user.id));
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  return authed(req, async (user) => {
    const { id } = await ctx.params;
    return ok(await deleteProduct(id, user.id));
  });
}
