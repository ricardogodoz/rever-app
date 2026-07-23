"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  productionSchema,
  type ProductionInput,
} from "@/modules/productions/schemas";
import {
  createProduction,
  ProductionServiceError,
} from "@/modules/productions/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createProductionAction(
  input: ProductionInput,
): Promise<{ error: string } | undefined> {
  const parsed = productionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  let productionId: string;
  try {
    const production = await createProduction(parsed.data, userId);
    productionId = production!.id;
  } catch (error) {
    if (error instanceof ProductionServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/producao");
  redirect(`/producao/${productionId}`);
}
