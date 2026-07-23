"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  financialEntrySchema,
  type FinancialEntryInput,
} from "@/modules/financial-entries/schemas";
import {
  createEntry,
  updateEntry,
  cancelEntry,
  FinancialEntryServiceError,
} from "@/modules/financial-entries/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createIncomeAction(
  input: FinancialEntryInput,
): Promise<{ error: string } | undefined> {
  const parsed = financialEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createEntry("INCOME", parsed.data, userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/receitas");
  revalidatePath("/bancos");
  redirect("/receitas");
}

export async function updateIncomeAction(
  id: string,
  input: FinancialEntryInput,
): Promise<{ error: string } | undefined> {
  const parsed = financialEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await updateEntry(id, "INCOME", parsed.data, userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/receitas");
  revalidatePath("/bancos");
  redirect("/receitas");
}

export async function cancelIncomeAction(
  id: string,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await cancelEntry(id, "INCOME", userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/receitas");
  revalidatePath("/bancos");
}
