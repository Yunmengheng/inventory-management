import { adjustStock } from "@/lib/domain";
import { authed, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  return authed(req, async (user) => ok(await adjustStock(await readJson(req), user.id)));
}
