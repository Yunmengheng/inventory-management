import { updateUser } from "@/lib/domain";
import { authed, HttpError, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return authed(req, async (user) => {
    if (user.role !== "ADMIN") throw new HttpError(403, "Only an admin can manage users.");
    return ok(await updateUser((await ctx.params).id, await readJson(req), user.id));
  });
}
