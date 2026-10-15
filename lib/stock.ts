import { Prisma } from "@prisma/client";
import { HttpError } from "./http";

export type Tx = Prisma.TransactionClient;

export async function ensureInventory(tx: Tx, productId: string, warehouseId: string) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Product not found.");
  const warehouse = await tx.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse) throw new HttpError(404, "Warehouse not found.");
  return tx.productInventory.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    create: { productId, warehouseId, quantity: 0, reserved: 0 },
    update: {},
  });
}

export async function applyStockChange(
  tx: Tx,
  input: {
    productId: string;
    warehouseId: string;
    delta: number;
    type: string;
    notes?: string | null;
    userId?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
    at?: Date;
  },
) {
  const inventory = await ensureInventory(tx, input.productId, input.warehouseId);
  const next = inventory.quantity + input.delta;
  if (next < -0.0001) {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    throw new HttpError(400, `Not enough stock for ${product?.name || "this product"}.`);
  }
  await tx.productInventory.update({
    where: { id: inventory.id },
    data: { quantity: Math.round(next * 1000) / 1000 },
  });
  await tx.inventoryTransaction.create({
    data: {
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: input.type,
      quantity: input.delta,
      notes: input.notes || null,
      userId: input.userId || null,
      referenceType: input.referenceType || null,
      referenceId: input.referenceId || null,
      ...(input.at ? { createdAt: input.at } : {}),
    },
  });
}
