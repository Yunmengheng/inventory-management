import { authed, ok, readPage } from "@/lib/http";
import { lowStockRows } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize } = readPage(url);
    const level = url.searchParams.get("level");
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    let rows = await lowStockRows();
    if (level === "critical" || level === "warning") rows = rows.filter((row) => row.level === level);
    if (search) rows = rows.filter((row) => `${row.product} ${row.sku}`.toLowerCase().includes(search));
    const total = rows.length;
    const data = rows.slice((page - 1) * pageSize, page * pageSize);
    return ok({ data, total, page, pageSize });
  });
}
