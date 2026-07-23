import { describe, expect, it } from "vitest";
import { financialCategorySchema } from "./schemas";

describe("financialCategorySchema", () => {
  it("aceita uma categoria válida", () => {
    const result = financialCategorySchema.safeParse({
      name: "Vendas",
      kind: "INCOME",
    });
    expect(result.success).toBe(true);
  });

  it("exige nome", () => {
    const result = financialCategorySchema.safeParse({
      name: "",
      kind: "INCOME",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = financialCategorySchema.safeParse({
      name: "Vendas",
      kind: "OUTRO",
    });
    expect(result.success).toBe(false);
  });
});
