import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  ProductionInput,
  ProductionListQuery,
} from "@/modules/productions/schemas";

export class ProductionServiceError extends Error {}

const PRODUCTION_INCLUDE = {
  finishedProduct: true,
  sourceWarehouse: true,
  destinationWarehouse: true,
  items: { include: { materialProduct: true } },
} satisfies Prisma.ProductionInclude;

export function listProductions(query: ProductionListQuery) {
  const where: Prisma.ProductionWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }
  if (query.q) {
    where.OR = [
      { code: { contains: query.q, mode: "insensitive" } },
      { finishedProduct: { name: { contains: query.q, mode: "insensitive" } } },
      { finishedProduct: { sku: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  return db.production.findMany({
    where,
    include: PRODUCTION_INCLUDE,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function getProduction(id: string) {
  return db.production.findUnique({
    where: { id },
    include: PRODUCTION_INCLUDE,
  });
}

async function generateProductionCode(tx: Prisma.TransactionClient) {
  const count = await tx.production.count();
  return `PRD-${String(count + 1).padStart(6, "0")}`;
}

export async function createProduction(
  input: ProductionInput,
  userId: string,
) {
  const finishedProduct = await db.product.findUnique({
    where: { id: input.finishedProductId },
  });
  if (
    !finishedProduct ||
    finishedProduct.type !== "FINISHED" ||
    !finishedProduct.active
  ) {
    throw new ProductionServiceError("Produto final inválido ou inativo.");
  }

  const [sourceWarehouse, destinationWarehouse] = await Promise.all([
    db.warehouse.findUnique({ where: { id: input.sourceWarehouseId } }),
    db.warehouse.findUnique({ where: { id: input.destinationWarehouseId } }),
  ]);
  if (!sourceWarehouse || !sourceWarehouse.active) {
    throw new ProductionServiceError(
      "Armazém de origem dos materiais inválido ou inativo.",
    );
  }
  if (!destinationWarehouse || !destinationWarehouse.active) {
    throw new ProductionServiceError(
      "Armazém de destino do produto final inválido ou inativo.",
    );
  }

  const composition = await db.composition.findFirst({
    where: { finishedProductId: input.finishedProductId, active: true },
    include: { items: true },
  });
  if (!composition) {
    throw new ProductionServiceError(
      "Este produto final não possui uma composição ativa. Cadastre uma composição antes de criar uma produção.",
    );
  }

  const quantity = new Prisma.Decimal(input.quantity);

  const productionId = await db.$transaction(async (tx) => {
    const code = await generateProductionCode(tx);

    const production = await tx.production.create({
      data: {
        code,
        finishedProductId: input.finishedProductId,
        quantity,
        sourceWarehouseId: input.sourceWarehouseId,
        destinationWarehouseId: input.destinationWarehouseId,
        notes: input.notes ?? null,
        createdById: userId,
        updatedById: userId,
      },
    });

    await tx.productionItem.createMany({
      data: composition.items.map((item) => ({
        productionId: production.id,
        materialProductId: item.materialProductId,
        quantityPerUnit: item.quantity,
        quantityUsed: item.quantity.times(quantity),
      })),
    });

    return production.id;
  });

  return getProduction(productionId);
}
