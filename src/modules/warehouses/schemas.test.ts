import { describe, expect, it } from "vitest";
import { warehouseListQuerySchema, warehouseSchema } from "./schemas";

describe("warehouseSchema", () => {
  it("aceita um armazém válido", () => {
    const result = warehouseSchema.safeParse({
      code: "MATRIZ",
      name: "Armazém Matriz",
      location: "Rua A, 123",
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });

  it("exige código", () => {
    const result = warehouseSchema.safeParse({
      code: "",
      name: "Armazém",
      isDefault: false,
    });
    expect(result.success).toBe(false);
  });

  it("exige nome", () => {
    const result = warehouseSchema.safeParse({
      code: "MATRIZ",
      name: "",
      isDefault: false,
    });
    expect(result.success).toBe(false);
  });

  it("aceita localização vazia", () => {
    const result = warehouseSchema.safeParse({
      code: "MATRIZ",
      name: "Armazém",
      location: "",
      isDefault: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("warehouseListQuerySchema", () => {
  it("usa valores padrão de ordenação", () => {
    const result = warehouseListQuerySchema.parse({});
    expect(result.sort).toBe("name");
    expect(result.order).toBe("asc");
  });
});
