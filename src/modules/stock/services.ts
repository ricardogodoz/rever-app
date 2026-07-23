import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  StockMovementInput,
  StockMovementListQuery,
} from "@/modules/stock/schemas";

export class StockServiceError extends Error {}

const MOVEMENT_INCLUDE = {
  product: true,
  fromWarehouse: true,
  toWarehouse: true,
  reversalOf: true,
  reversedBy: true,
} satisfies Prisma.StockMovementInclude;

function isInboundType(type: string) {
  return type === "MANUAL_IN" || type === "ADJUST_IN";
}

export async function recordManualMovement(
  input: StockMovementInput,
  userId: string,
) {
  const product = await db.product.findUnique({
    where: { id: input.productId },
  });
  if (!product || !product.active) {
    throw new StockServiceError("Produto inválido ou inativo.");
  }

  const warehouse = await db.warehouse.findUnique({
    where: { id: input.warehouseId },
  });
  if (!warehouse || !warehouse.active) {
    throw new StockServiceError("Armazém inválido ou inativo.");
  }

  const quantity = new Prisma.Decimal(input.quantity);
  const inbound = isInboundType(input.type);

  return db.$transaction(async (tx) => {
    const balance = await tx.stockBalance.findUnique({
      where: {
        productId_warehouseId: {
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
      },
    });
    const currentQuantity = balance?.quantity ?? new Prisma.Decimal(0);

    if (!inbound && currentQuantity.lessThan(quantity)) {
      throw new StockServiceError(
        `Saldo insuficiente de "${product.name}" em ${warehouse.name}. ` +
          `Disponível: ${currentQuantity.toString()}, necessário: ${quantity.toString()}.`,
      );
    }

    const newQuantity = inbound
      ? currentQuantity.plus(quantity)
      : currentQuantity.minus(quantity);

    await tx.stockBalance.upsert({
      where: {
        productId_warehouseId: {
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
      },
      create: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: newQuantity,
      },
      update: { quantity: newQuantity },
    });

    return tx.stockMovement.create({
      data: {
        type: input.type,
        productId: input.productId,
        quantity,
        toWarehouseId: inbound ? input.warehouseId : null,
        fromWarehouseId: inbound ? null : input.warehouseId,
        reason: input.reason,
        notes: input.notes ?? null,
        createdById: userId,
        updatedById: userId,
      },
      include: MOVEMENT_INCLUDE,
    });
  });
}

export async function listStockMovements(query: StockMovementListQuery) {
  const where: Prisma.StockMovementWhereInput = {};

  if (query.productId) {
    where.productId = query.productId;
  }
  if (query.warehouseId) {
    where.OR = [
      { fromWarehouseId: query.warehouseId },
      { toWarehouseId: query.warehouseId },
    ];
  }
  if (query.type) {
    where.type = query.type as Prisma.StockMovementWhereInput["type"];
  }
  if (query.dateFrom || query.dateTo) {
    where.date = {
      ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00`) } : {}),
      ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59`) } : {}),
    };
  }

  return db.stockMovement.findMany({
    where,
    include: MOVEMENT_INCLUDE,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function reverseStockMovement(movementId: string, userId: string) {
  const movement = await db.stockMovement.findUnique({
    where: { id: movementId },
    include: { reversedBy: true },
  });

  if (!movement) {
    throw new StockServiceError("Movimentação não encontrada.");
  }
  if (movement.type === "REVERSAL") {
    throw new StockServiceError("Não é possível estornar um estorno.");
  }
  if (movement.reversedBy) {
    throw new StockServiceError("Esta movimentação já foi estornada.");
  }

  const warehouseId = movement.toWarehouseId ?? movement.fromWarehouseId;
  if (!warehouseId) {
    throw new StockServiceError(
      "Esta movimentação não pode ser estornada automaticamente.",
    );
  }
  const wasInbound = Boolean(movement.toWarehouseId);

  return db.$transaction(async (tx) => {
    const balance = await tx.stockBalance.findUnique({
      where: {
        productId_warehouseId: {
          productId: movement.productId,
          warehouseId,
        },
      },
    });
    const currentQuantity = balance?.quantity ?? new Prisma.Decimal(0);

    if (wasInbound && currentQuantity.lessThan(movement.quantity)) {
      throw new StockServiceError(
        `Saldo insuficiente para estornar. Disponível: ${currentQuantity.toString()}, ` +
          `necessário: ${movement.quantity.toString()}.`,
      );
    }

    const newQuantity = wasInbound
      ? currentQuantity.minus(movement.quantity)
      : currentQuantity.plus(movement.quantity);

    await tx.stockBalance.upsert({
      where: {
        productId_warehouseId: {
          productId: movement.productId,
          warehouseId,
        },
      },
      create: {
        productId: movement.productId,
        warehouseId,
        quantity: newQuantity,
      },
      update: { quantity: newQuantity },
    });

    return tx.stockMovement.create({
      data: {
        type: "REVERSAL",
        productId: movement.productId,
        quantity: movement.quantity,
        toWarehouseId: wasInbound ? null : warehouseId,
        fromWarehouseId: wasInbound ? warehouseId : null,
        reason: `Estorno: ${movement.reason}`,
        reversalOfId: movement.id,
        createdById: userId,
        updatedById: userId,
      },
      include: MOVEMENT_INCLUDE,
    });
  });
}

export async function listWarehouseIdsWithStock(): Promise<Set<string>> {
  const balances = await db.stockBalance.groupBy({
    by: ["warehouseId"],
    where: { quantity: { gt: 0 } },
  });
  return new Set(balances.map((balance) => balance.warehouseId));
}
