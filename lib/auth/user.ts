import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "./server";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  warehouseId: string | null;
  warehouse: { id: string; name: string; code: string } | null;
};

export async function getUserFromRequest(_req: Request): Promise<AuthUser | null> {
  const { data: session } = await auth.getSession();
  const neonUser = session?.user;
  const email = neonUser?.email?.toLowerCase();
  if (!neonUser || !email) return null;

  let user = await prisma.user.findUnique({
    where: { email },
    include: { warehouse: { select: { id: true, name: true, code: true } } },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: neonUser.name || email,
        password: await bcrypt.hash(crypto.randomUUID(), 10),
        role: "STAFF",
        status: "ACTIVE",
      },
      include: { warehouse: { select: { id: true, name: true, code: true } } },
    });
  }
  if (user.status !== "ACTIVE") return null;
  const { password: _password, ...safe } = user;
  return safe;
}
