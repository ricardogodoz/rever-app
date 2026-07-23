"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  bankAccountSchema,
  type BankAccountInput,
} from "@/modules/bank-accounts/schemas";
import {
  createBankAccount,
  updateBankAccount,
  setBankAccountActive,
  BankAccountServiceError,
} from "@/modules/bank-accounts/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createBankAccountAction(
  input: BankAccountInput,
): Promise<{ error: string } | undefined> {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createBankAccount(parsed.data, userId);
  } catch (error) {
    if (error instanceof BankAccountServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/bancos");
  redirect("/bancos");
}

export async function updateBankAccountAction(
  id: string,
  input: BankAccountInput,
): Promise<{ error: string } | undefined> {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await updateBankAccount(id, parsed.data, userId);
  } catch (error) {
    if (error instanceof BankAccountServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/bancos");
  redirect("/bancos");
}

export async function setBankAccountActiveAction(
  id: string,
  active: boolean,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await setBankAccountActive(id, active, userId);
  } catch (error) {
    if (error instanceof BankAccountServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/bancos");
}
