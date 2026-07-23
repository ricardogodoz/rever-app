import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type { ProductInput, ProductListQuery } from "@/modules/products/schemas";

export class ProductServiceError extends Error {}

export async function listProducts(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.status) {
    where.active = query.status === "active";
  }

  return db.product.findMany({
    where,
    orderBy: { [query.sort]: query.order },
  });
}

export function getProduct(id: string) {
  return db.product.findUnique({ where: { id } });
}

async function assertSkuAvailable(sku: string, excludeId?: string) {
  const existing = await db.product.findUnique({ where: { sku } });
  if (existing && existing.id !== excludeId) {
    throw new ProductServiceError(`Já existe um produto com o SKU "${sku}".`);
  }
}

export async function createProduct(input: ProductInput, userId: string) {
  await assertSkuAvailable(input.sku);

  return db.product.create({
    data: {
      sku: input.sku,
      name: input.name,
      type: input.type,
      unit: input.unit,
      description: input.description ?? null,
      barcode: input.barcode ?? null,
      unitCost: input.unitCost ?? null,
      defaultPrice: input.defaultPrice ?? null,
      minStock: input.minStock ?? null,
      imageUrl: input.imageUrl ?? null,
      notes: input.notes ?? null,
      createdById: userId,
      updatedById: userId,
    },
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  userId: string,
) {
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new ProductServiceError("Produto não encontrado.");
  }

  await assertSkuAvailable(input.sku, id);

  return db.product.update({
    where: { id },
    data: {
      sku: input.sku,
      name: input.name,
      type: input.type,
      unit: input.unit,
      description: input.description ?? null,
      barcode: input.barcode ?? null,
      unitCost: input.unitCost ?? null,
      defaultPrice: input.defaultPrice ?? null,
      minStock: input.minStock ?? null,
      imageUrl: input.imageUrl ?? null,
      notes: input.notes ?? null,
      updatedById: userId,
    },
  });
}

export async function setProductActive(
  id: string,
  active: boolean,
  userId: string,
) {
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new ProductServiceError("Produto não encontrado.");
  }

  return db.product.update({
    where: { id },
    data: { active, updatedById: userId },
  });
}
