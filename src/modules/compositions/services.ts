import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  CompositionInput,
  CompositionListQuery,
} from "@/modules/compositions/schemas";

export class CompositionServiceError extends Error {}

const COMPOSITION_INCLUDE = {
  finishedProduct: true,
  items: { include: { materialProduct: true } },
} satisfies Prisma.CompositionInclude;

export function listCompositions(query: CompositionListQuery) {
  const where: Prisma.CompositionWhereInput = {};

  if (query.status) {
    where.active = query.status === "active";
  }
  if (query.q) {
    where.finishedProduct = {
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { sku: { contains: query.q, mode: "insensitive" } },
      ],
    };
  }

  return db.composition.findMany({
    where,
    include: COMPOSITION_INCLUDE,
    orderBy: { finishedProduct: { name: "asc" } },
  });
}

export function getComposition(id: string) {
  return db.composition.findUnique({
    where: { id },
    include: COMPOSITION_INCLUDE,
  });
}

export function calculateEstimatedCost(items: {
  quantity: Prisma.Decimal;
  materialProduct: { unitCost: Prisma.Decimal | null };
}[]) {
  return items.reduce(
    (total, item) =>
      total.plus(item.quantity.times(item.materialProduct.unitCost ?? 0)),
    new Prisma.Decimal(0),
  );
}

function assertValidItems(
  finishedProductId: string,
  items: CompositionInput["items"],
) {
  const seen = new Set<string>();
  for (const item of items) {
    if (item.materialProductId === finishedProductId) {
      throw new CompositionServiceError(
        "O produto final não pode ser um material da própria composição.",
      );
    }
    if (seen.has(item.materialProductId)) {
      throw new CompositionServiceError(
        "Um material não pode se repetir na mesma composição.",
      );
    }
    seen.add(item.materialProductId);
  }
}

async function assertNoActiveComposition(
  finishedProductId: string,
  excludeId?: string,
) {
  const existing = await db.composition.findFirst({
    where: {
      finishedProductId,
      active: true,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  if (existing) {
    throw new CompositionServiceError(
      "Este produto final já possui uma composição ativa. Inative-a antes de criar outra.",
    );
  }
}

export async function createComposition(
  input: CompositionInput,
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
    throw new CompositionServiceError("Produto final inválido ou inativo.");
  }

  assertValidItems(input.finishedProductId, input.items);

  const materials = await db.product.findMany({
    where: { id: { in: input.items.map((item) => item.materialProductId) } },
  });
  for (const item of input.items) {
    const material = materials.find((m) => m.id === item.materialProductId);
    if (!material || material.type !== "MATERIAL" || !material.active) {
      throw new CompositionServiceError(
        "Um dos materiais selecionados é inválido ou está inativo.",
      );
    }
  }

  await assertNoActiveComposition(input.finishedProductId);

  const compositionId = await db.$transaction(async (tx) => {
    const composition = await tx.composition.create({
      data: {
        finishedProductId: input.finishedProductId,
        createdById: userId,
        updatedById: userId,
      },
    });

    await tx.compositionItem.createMany({
      data: input.items.map((item) => ({
        compositionId: composition.id,
        materialProductId: item.materialProductId,
        quantity: item.quantity,
      })),
    });

    return composition.id;
  });

  return getComposition(compositionId);
}

export async function setCompositionActive(
  id: string,
  active: boolean,
  userId: string,
) {
  const existing = await db.composition.findUnique({ where: { id } });
  if (!existing) {
    throw new CompositionServiceError("Composição não encontrada.");
  }

  if (active) {
    await assertNoActiveComposition(existing.finishedProductId, id);
  }

  return db.composition.update({
    where: { id },
    data: { active, updatedById: userId },
  });
}
