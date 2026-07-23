"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import {
  financialCategorySchema,
  type FinancialCategoryInput,
} from "@/modules/financial-categories/schemas";
import {
  createCategory,
  setCategoryActive,
  FinancialCategoryServiceError,
} from "@/modules/financial-categories/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createCategoryAction(
  input: FinancialCategoryInput,
): Promise<{ error: string } | undefined> {
  const parsed = financialCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createCategory(parsed.data, userId);
  } catch (error) {
    if (error instanceof FinancialCategoryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/configuracoes");
}

export async function setCategoryActiveAction(
  id: string,
  active: boolean,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await setCategoryActive(id, active, userId);
  } catch (error) {
    if (error instanceof FinancialCategoryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/configuracoes");
}
