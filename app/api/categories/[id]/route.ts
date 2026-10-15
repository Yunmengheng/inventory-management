import { deleteCategory, updateCategory } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  return authed(req, async (user) => ok(await updateCategory((await ctx.params).id, await readJson(req), user.id)));
}

export async function DELETE(req: Request, ctx: Ctx) {
  return authed(req, async (user) => ok(await deleteCategory((await ctx.params).id, user.id)));
}
