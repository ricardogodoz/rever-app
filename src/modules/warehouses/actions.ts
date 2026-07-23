"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import {
  warehouseSchema,
  type WarehouseInput,
} from "@/modules/warehouses/schemas";
import {
  createWarehouse,
  updateWarehouse,
  setWarehouseActive,
  WarehouseServiceError,
} from "@/modules/warehouses/services";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Sessão inválida.");
  }
  return userId;
}

export async function createWarehouseAction(
  input: WarehouseInput,
): Promise<{ error: string } | undefined> {
  const parsed = warehouseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await createWarehouse(parsed.data, userId);
  } catch (error) {
    if (error instanceof WarehouseServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/armazens");
  redirect("/armazens");
}

export async function updateWarehouseAction(
  id: string,
  input: WarehouseInput,
): Promise<{ error: string } | undefined> {
  const parsed = warehouseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos. Revise os campos destacados." };
  }

  const userId = await requireUserId();

  try {
    await updateWarehouse(id, parsed.data, userId);
  } catch (error) {
    if (error instanceof WarehouseServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/armazens");
  redirect("/armazens");
}

export async function setWarehouseActiveAction(
  id: string,
  active: boolean,
): Promise<{ error: string } | undefined> {
  const userId = await requireUserId();

  try {
    await setWarehouseActive(id, active, userId);
  } catch (error) {
    if (error instanceof WarehouseServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/armazens");
}
