import { describe, expect, it } from "vitest";
import { productionSchema } from "./schemas";

const validProduction = {
  finishedProductId: "finished-1",
  quantity: "10",
  sourceWarehouseId: "wh-1",
  destinationWarehouseId: "wh-2",
  notes: "",
};

describe("productionSchema", () => {
  it("aceita uma produção válida", () => {
    const result = productionSchema.safeParse(validProduction);
    expect(result.success).toBe(true);
  });

  it("exige produto final", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      finishedProductId: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige armazém de origem", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      sourceWarehouseId: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige armazém de destino", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      destinationWarehouseId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade zero", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      quantity: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade negativa", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      quantity: "-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade com mais de 3 casas decimais", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      quantity: "10.1234",
    });
    expect(result.success).toBe(false);
  });

  it("aceita a mesma origem e destino (armazém único)", () => {
    const result = productionSchema.safeParse({
      ...validProduction,
      sourceWarehouseId: "wh-1",
      destinationWarehouseId: "wh-1",
    });
    expect(result.success).toBe(true);
  });
});
