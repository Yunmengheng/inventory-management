import { createCategory } from "@/lib/domain";
import { authed, ok, readJson, readPage, textSearch } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip, search } = readPage(url);
    const where = search ? { OR: [{ name: textSearch(search) }, { slug: textSearch(search) }] } : {};
    const [total, data] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}

export async function POST(req: Request) {
  return authed(req, async (user) => ok(await createCategory(await readJson(req), user.id), 201));
}
