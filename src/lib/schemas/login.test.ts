import { describe, expect, it } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema", () => {
  it("aceita e-mail e senha válidos", () => {
    const result = loginSchema.safeParse({
      email: "admin@rever.local",
      password: "senha-secreta",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "nao-e-um-email",
      password: "senha-secreta",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({
      email: "admin@rever.local",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
