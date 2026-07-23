"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/modules/stock/schemas";
import {
  recordManualMovement,
  reverseStockMovement,
  StockServiceError,
} from "@/modules/stock/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function recordManualMovementAction(
  input: StockMovementInput,
): Promise<{ error: string } | undefined> {
  const parsed = stockMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await recordManualMovement(parsed.data, userId);
  } catch (error) {
    if (error instanceof StockServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/estoque");
  revalidatePath("/armazens");
  redirect("/estoque");
}

export async function reverseStockMovementAction(
  movementId: string,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await reverseStockMovement(movementId, userId);
  } catch (error) {
    if (error instanceof StockServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/estoque");
  revalidatePath("/armazens");
}
