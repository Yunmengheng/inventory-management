import { authed, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return authed(req, async () => {
    const [warehouses, categories, suppliers, customers, products] = await Promise.all([
      prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.supplier.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.customer.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true,
          uom: true,
          costPrice: true,
          sellingPrice: true,
          discountPct: true,
          categoryId: true,
          supplierId: true,
          minStock: true,
          status: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);
    return ok({ warehouses, categories, suppliers, customers, products });
  });
}
