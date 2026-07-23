import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  WarehouseInput,
  WarehouseListQuery,
} from "@/modules/warehouses/schemas";

export class WarehouseServiceError extends Error {}

export async function listWarehouses(query: WarehouseListQuery) {
  const where: Prisma.WarehouseWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { code: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.status) {
    where.active = query.status === "active";
  }

  return db.warehouse.findMany({
    where,
    orderBy: { [query.sort]: query.order },
  });
}

export function getWarehouse(id: string) {
  return db.warehouse.findUnique({ where: { id } });
}

async function assertCodeAvailable(code: string, excludeId?: string) {
  const existing = await db.warehouse.findUnique({ where: { code } });
  if (existing && existing.id !== excludeId) {
    throw new WarehouseServiceError(
      `Já existe um armazém com o código "${code}".`,
    );
  }
}

export async function createWarehouse(input: WarehouseInput, userId: string) {
  await assertCodeAvailable(input.code);

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.warehouse.create({
      data: {
        code: input.code,
        name: input.name,
        location: input.location ?? null,
        isDefault: input.isDefault,
        createdById: userId,
        updatedById: userId,
      },
    });
  });
}

export async function updateWarehouse(
  id: string,
  input: WarehouseInput,
  userId: string,
) {
  const existing = await db.warehouse.findUnique({ where: { id } });
  if (!existing) {
    throw new WarehouseServiceError("Armazém não encontrado.");
  }

  await assertCodeAvailable(input.code, id);

  if (existing.isDefault && !input.isDefault) {
    throw new WarehouseServiceError(
      "Defina outro armazém como padrão antes de remover esta marcação.",
    );
  }

  return db.$transaction(async (tx) => {
    if (input.isDefault && !existing.isDefault) {
      await tx.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.warehouse.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        location: input.location ?? null,
        isDefault: input.isDefault,
        updatedById: userId,
      },
    });
  });
}

export async function setWarehouseActive(
  id: string,
  active: boolean,
  userId: string,
) {
  const existing = await db.warehouse.findUnique({ where: { id } });
  if (!existing) {
    throw new WarehouseServiceError("Armazém não encontrado.");
  }

  if (!active && existing.isDefault) {
    throw new WarehouseServiceError(
      "Não é possível inativar o armazém padrão. Defina outro armazém como padrão antes.",
    );
  }

  return db.warehouse.update({
    where: { id },
    data: { active, updatedById: userId },
  });
}
