import { db } from "@/server/db";
import type {
  FinancialCategoryInput,
  FinancialEntryKind,
} from "@/modules/financial-categories/schemas";

export class FinancialCategoryServiceError extends Error {}

export function listCategories(options?: {
  kind?: FinancialEntryKind;
  status?: "active" | "inactive";
}) {
  return db.financialCategory.findMany({
    where: {
      kind: options?.kind,
      active:
        options?.status === "active"
          ? true
          : options?.status === "inactive"
            ? false
            : undefined,
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(
  input: FinancialCategoryInput,
  userId: string,
) {
  const existing = await db.financialCategory.findUnique({
    where: { name_kind: { name: input.name, kind: input.kind } },
  });
  if (existing) {
    throw new FinancialCategoryServiceError(
      `Já existe uma categoria "${input.name}" para este tipo.`,
    );
  }

  return db.financialCategory.create({
    data: {
      name: input.name,
      kind: input.kind,
      createdById: userId,
      updatedById: userId,
    },
  });
}

export async function setCategoryActive(
  id: string,
  active: boolean,
  userId: string,
) {
  const existing = await db.financialCategory.findUnique({ where: { id } });
  if (!existing) {
    throw new FinancialCategoryServiceError("Categoria não encontrada.");
  }

  return db.financialCategory.update({
    where: { id },
    data: { active, updatedById: userId },
  });
}
