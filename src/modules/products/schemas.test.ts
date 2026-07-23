import { describe, expect, it } from "vitest";
import { productListQuerySchema, productSchema } from "./schemas";

const validProduct = {
  sku: "MAT-001",
  name: "Tecido azul",
  type: "MATERIAL",
  unit: "M",
  description: "",
  barcode: "",
  unitCost: "10.50",
  defaultPrice: "",
  minStock: "5.5",
  imageUrl: "",
  notes: "",
};

describe("productSchema", () => {
  it("aceita um produto válido", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("exige SKU", () => {
    const result = productSchema.safeParse({ ...validProduct, sku: "" });
    expect(result.success).toBe(false);
  });

  it("exige nome", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      type: "OUTRO",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita unidade inválida", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      unit: "OUTRO",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita custo com mais de 2 casas decimais", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      unitCost: "10.999",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita estoque mínimo com mais de 3 casas decimais", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      minStock: "10.9999",
    });
    expect(result.success).toBe(false);
  });

  it("aceita campos opcionais vazios", () => {
    const result = productSchema.safeParse({
      sku: "MAT-002",
      name: "Linha branca",
      type: "MATERIAL",
      unit: "UNIT",
      description: "",
      barcode: "",
      unitCost: "",
      defaultPrice: "",
      minStock: "",
      imageUrl: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita URL de imagem inválida", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      imageUrl: "nao-e-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("productListQuerySchema", () => {
  it("usa valores padrão de ordenação", () => {
    const result = productListQuerySchema.parse({});
    expect(result.sort).toBe("name");
    expect(result.order).toBe("asc");
  });

  it("rejeita campo de ordenação inválido", () => {
    const result = productListQuerySchema.safeParse({ sort: "invalido" });
    expect(result.success).toBe(false);
  });
});
