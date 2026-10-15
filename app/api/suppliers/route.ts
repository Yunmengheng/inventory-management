import { createSupplier } from "@/lib/domain";
import { authed, ok, readJson, readPage, textSearch } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip, search } = readPage(url);
    const status = url.searchParams.get("status");
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? { OR: [{ name: textSearch(search) }, { email: textSearch(search) }, { phone: textSearch(search) }, { city: textSearch(search) }] }
        : {}),
    };
    const [total, data] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({ where, orderBy: { name: "asc" }, skip, take: pageSize }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}

export async function POST(req: Request) {
  return authed(req, async (user) => ok(await createSupplier(await readJson(req), user.id), 201));
}
