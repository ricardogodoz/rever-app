"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas/login";

export async function loginAction(
  input: LoginInput,
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." };
    }
    throw error;
  }
}
