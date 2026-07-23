import { describe, expect, it } from "vitest";
import { compositionSchema } from "./schemas";

const validComposition = {
  finishedProductId: "finished-1",
  items: [
    { materialProductId: "material-1", quantity: "2.5" },
    { materialProductId: "material-2", quantity: "1" },
  ],
};

describe("compositionSchema", () => {
  it("aceita uma composição válida", () => {
    const result = compositionSchema.safeParse(validComposition);
    expect(result.success).toBe(true);
  });

  it("exige produto final", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      finishedProductId: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige ao menos um material", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("exige material selecionado em cada item", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [{ materialProductId: "", quantity: "1" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade zero", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [{ materialProductId: "material-1", quantity: "0" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade negativa", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [{ materialProductId: "material-1", quantity: "-1" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade com mais de 3 casas decimais", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [{ materialProductId: "material-1", quantity: "1.2345" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita material duplicado", () => {
    const result = compositionSchema.safeParse({
      ...validComposition,
      items: [
        { materialProductId: "material-1", quantity: "1" },
        { materialProductId: "material-1", quantity: "2" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita o produto final como material da própria composição", () => {
    const result = compositionSchema.safeParse({
      finishedProductId: "finished-1",
      items: [{ materialProductId: "finished-1", quantity: "1" }],
    });
    expect(result.success).toBe(false);
  });
});
