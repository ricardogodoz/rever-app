"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { productSchema, type ProductInput } from "@/modules/products/schemas";
import {
  createProduct,
  updateProduct,
  setProductActive,
  ProductServiceError,
} from "@/modules/products/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createProductAction(
  input: ProductInput,
): Promise<{ error: string } | undefined> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createProduct(parsed.data, userId);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<{ error: string } | undefined> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await updateProduct(id, parsed.data, userId);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function setProductActiveAction(
  id: string,
  active: boolean,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await setProductActive(id, active, userId);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/produtos");
}
