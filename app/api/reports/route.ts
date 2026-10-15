import { authed, ok } from "@/lib/http";
import { reportData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => ok(await reportData(new URL(req.url))));
}
