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

export async function createExpenseAction(
  input: FinancialEntryInput,
): Promise<{ error: string } | undefined> {
  const parsed = financialEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createEntry("EXPENSE", parsed.data, userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/despesas");
  revalidatePath("/bancos");
  redirect("/despesas");
}

export async function updateExpenseAction(
  id: string,
  input: FinancialEntryInput,
): Promise<{ error: string } | undefined> {
  const parsed = financialEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await updateEntry(id, "EXPENSE", parsed.data, userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/despesas");
  revalidatePath("/bancos");
  redirect("/despesas");
}

export async function cancelExpenseAction(
  id: string,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await cancelEntry(id, "EXPENSE", userId);
  } catch (error) {
    if (error instanceof FinancialEntryServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/despesas");
  revalidatePath("/bancos");
}
