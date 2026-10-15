import { createUser } from "@/lib/domain";
import { authed, HttpError, ok, readJson, readPage, textSearch } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatarUrl: true,
  status: true,
  warehouseId: true,
  createdAt: true,
  warehouse: { select: { id: true, name: true, code: true } },
} as const;

export async function GET(req: Request) {
  return authed(req, async () => {
    const url = new URL(req.url);
    const { page, pageSize, skip, search } = readPage(url);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const where = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ name: textSearch(search) }, { email: textSearch(search) }] } : {}),
    };
    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, select: userSelect, orderBy: { name: "asc" }, skip, take: pageSize }),
    ]);
    return ok({ data, total, page, pageSize });
  });
}

export async function POST(req: Request) {
  return authed(req, async (user) => {
    if (user.role !== "ADMIN") throw new HttpError(403, "Only an admin can manage users.");
    return ok(await createUser(await readJson(req), user.id), 201);
  });
}
