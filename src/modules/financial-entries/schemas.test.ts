import { describe, expect, it } from "vitest";
import {
  financialEntryListQuerySchema,
  financialEntrySchema,
  getEntrySituationLabel,
} from "./schemas";

const validEntry = {
  description: "Venda de produtos",
  categoryId: "cat-1",
  bankAccountId: "",
  amount: "150.00",
  competenceDate: "2026-01-10",
  dueDate: "",
  settledAt: "",
  notes: "",
};

describe("financialEntrySchema", () => {
  it("aceita um lançamento pendente (sem conta nem data de recebimento)", () => {
    const result = financialEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("exige descrição", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige categoria", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      categoryId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita valor zero", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      amount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita valor com mais de 2 casas decimais", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      amount: "10.999",
    });
    expect(result.success).toBe(false);
  });

  it("exige data de competência válida", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      competenceDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("aceita vencimento vazio", () => {
    const result = financialEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("exige conta bancária quando a data está preenchida", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      settledAt: "2026-01-10",
      bankAccountId: "",
    });
    expect(result.success).toBe(false);
  });

  it("aceita quando a data e a conta estão preenchidas juntas", () => {
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      settledAt: "2026-01-10",
      bankAccountId: "acc-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita data de recebimento/pagamento futura", () => {
    const farFuture = "2999-01-01";
    const result = financialEntrySchema.safeParse({
      ...validEntry,
      settledAt: farFuture,
      bankAccountId: "acc-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("financialEntryListQuerySchema", () => {
  it("aceita filtros vazios", () => {
    const result = financialEntryListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejeita situação inválida", () => {
    const result = financialEntryListQuerySchema.safeParse({
      situation: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("aceita situação válida", () => {
    const result = financialEntryListQuerySchema.safeParse({
      situation: "settled",
    });
    expect(result.success).toBe(true);
  });
});

describe("getEntrySituationLabel", () => {
  it("retorna Pendente quando não há data nem cancelamento", () => {
    expect(
      getEntrySituationLabel("INCOME", { settledAt: null, cancelledAt: null }),
    ).toBe("Pendente");
  });

  it("retorna Recebida para receita com data preenchida", () => {
    expect(
      getEntrySituationLabel("INCOME", {
        settledAt: new Date(),
        cancelledAt: null,
      }),
    ).toBe("Recebida");
  });

  it("retorna Paga para despesa com data preenchida", () => {
    expect(
      getEntrySituationLabel("EXPENSE", {
        settledAt: new Date(),
        cancelledAt: null,
      }),
    ).toBe("Paga");
  });

  it("retorna Cancelada quando cancelledAt está preenchido, mesmo com settledAt", () => {
    expect(
      getEntrySituationLabel("INCOME", {
        settledAt: new Date(),
        cancelledAt: new Date(),
      }),
    ).toBe("Cancelada");
  });
});
