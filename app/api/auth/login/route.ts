import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { asString, ok, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = asString(body.email).toLowerCase();
  const password = asString(body.password);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { warehouse: { select: { id: true, name: true, code: true } } },
  });
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) return ok({ error: "Email or password is incorrect." }, 401);
  if (user.status !== "ACTIVE") return ok({ error: "This account is inactive." }, 403);
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      resourceType: "USER",
      resourceId: user.id,
      description: `${user.email} signed in`,
    },
  });
  const token = await signToken(user);
  const { password: _password, ...safe } = user;
  return ok({ token, user: safe });
}
