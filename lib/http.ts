import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getUserFromRequest, type AuthUser } from "./auth";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function textSearch(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function authed(req: Request, handler: (user: AuthUser) => Promise<Response>) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return ok({ error: "Unauthorized" }, 401);
    return await handler(user);
  } catch (error) {
    if (error instanceof HttpError) return ok({ error: error.message }, error.status);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return ok({ error: "That value is already in use." }, 409);
      if (error.code === "P2003") return ok({ error: "This record is still linked to other data." }, 400);
    }
    console.error(error);
    return ok({ error: "Something went wrong." }, 500);
  }
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}

export function readPage(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 10) || 10));
  const search = (url.searchParams.get("search") || "").trim();
  return { page, pageSize, search, skip: (page - 1) * pageSize };
}

export function readRange(url: URL) {
  const today = new Date();
  const fallbackTo = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  const fallbackFrom = new Date(fallbackTo);
  fallbackFrom.setDate(fallbackFrom.getDate() - 29);
  fallbackFrom.setHours(0, 0, 0, 0);
  const from = parseDay(url.searchParams.get("from"), fallbackFrom, false);
  const to = parseDay(url.searchParams.get("to"), fallbackTo, true);
  if (from > to) return { from: to, to: from };
  return { from, to };
}

function parseDay(value: string | null, fallback: Date, end: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
}

export function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function optionalDate(value: unknown) {
  const raw = asString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
