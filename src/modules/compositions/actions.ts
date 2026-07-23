"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  compositionSchema,
  type CompositionInput,
} from "@/modules/compositions/schemas";
import {
  createComposition,
  setCompositionActive,
  CompositionServiceError,
} from "@/modules/compositions/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createCompositionAction(
  input: CompositionInput,
): Promise<{ error: string } | undefined> {
  const parsed = compositionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  let compositionId: string;
  try {
    const composition = await createComposition(parsed.data, userId);
    compositionId = composition!.id;
  } catch (error) {
    if (error instanceof CompositionServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/composicao");
  redirect(`/composicao/${compositionId}`);
}

export async function setCompositionActiveAction(
  id: string,
  active: boolean,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await setCompositionActive(id, active, userId);
  } catch (error) {
    if (error instanceof CompositionServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/composicao");
  revalidatePath(`/composicao/${id}`);
}
