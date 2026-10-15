import { authed, ok } from "@/lib/http";
import { forecastData } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => ok(await forecastData()));
}
