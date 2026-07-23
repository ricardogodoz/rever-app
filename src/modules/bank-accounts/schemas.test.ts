import { describe, expect, it } from "vitest";
import { bankAccountSchema } from "./schemas";

const validAccount = {
  name: "Conta Principal",
  institution: "Banco XPTO",
  type: "CHECKING",
  initialBalance: "1000.00",
  initialBalanceDate: "2026-01-01",
  notes: "",
};

describe("bankAccountSchema", () => {
  it("aceita uma conta válida", () => {
    const result = bankAccountSchema.safeParse(validAccount);
    expect(result.success).toBe(true);
  });

  it("exige nome", () => {
    const result = bankAccountSchema.safeParse({ ...validAccount, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("exige saldo inicial", () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      initialBalance: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita saldo com mais de 2 casas decimais", () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      initialBalance: "10.999",
    });
    expect(result.success).toBe(false);
  });

  it("exige data do saldo inicial válida", () => {
    const result = bankAccountSchema.safeParse({
      ...validAccount,
      initialBalanceDate: "data-invalida",
    });
    expect(result.success).toBe(false);
  });
});
