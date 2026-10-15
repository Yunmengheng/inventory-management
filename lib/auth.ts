import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

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

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "sovann-dev-secret-change-me");
}

export async function signToken(user: { id: string; email: string; role: string }) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getUserFromRequest(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { warehouse: { select: { id: true, name: true, code: true } } },
    });
    if (!user || user.status !== "ACTIVE") return null;
    const { password: _password, ...safe } = user;
    return safe;
  } catch {
    return null;
  }
}
