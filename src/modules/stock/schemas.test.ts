import { describe, expect, it } from "vitest";
import { stockMovementSchema } from "./schemas";

const validMovement = {
  type: "MANUAL_IN",
  productId: "prod-1",
  warehouseId: "wh-1",
  quantity: "10.5",
  reason: "Entrada inicial",
  notes: "",
};

describe("stockMovementSchema", () => {
  it("aceita uma movimentação válida", () => {
    const result = stockMovementSchema.safeParse(validMovement);
    expect(result.success).toBe(true);
  });

  it("exige produto", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      productId: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige armazém", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      warehouseId: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige motivo", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade zero", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      quantity: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade negativa", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      quantity: "-5",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade com mais de 3 casas decimais", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      quantity: "10.5555",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = stockMovementSchema.safeParse({
      ...validMovement,
      type: "TRANSFER_OUT",
    });
    expect(result.success).toBe(false);
  });
});
