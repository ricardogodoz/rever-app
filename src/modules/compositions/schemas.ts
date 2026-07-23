import { z } from "zod";

const quantityPattern = /^\d+(\.\d{1,3})?$/;

export const compositionItemSchema = z.object({
  materialProductId: z
    .string()
    .trim()
    .min(1, { message: "Selecione o material." }),
  quantity: z
    .string()
    .trim()
    .min(1, { message: "Informe a quantidade." })
    .refine((value) => quantityPattern.test(value), {
      message: "Quantidade inválida. Use até 3 casas decimais.",
    })
    .refine((value) => Number(value) > 0, {
      message: "A quantidade deve ser maior que zero.",
    }),
});

export type CompositionItemInput = z.infer<typeof compositionItemSchema>;

export const compositionSchema = z
  .object({
    finishedProductId: z
      .string()
      .trim()
      .min(1, { message: "Selecione o produto final." }),
    items: z
      .array(compositionItemSchema)
      .min(1, { message: "Adicione ao menos um material." }),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.items.forEach((item, index) => {
      if (!item.materialProductId) return;

      if (item.materialProductId === data.finishedProductId) {
        ctx.addIssue({
          code: "custom",
          message:
            "O produto final não pode ser um material da própria composição.",
          path: ["items", index, "materialProductId"],
        });
      }

      if (seen.has(item.materialProductId)) {
        ctx.addIssue({
          code: "custom",
          message: "Este material já foi adicionado.",
          path: ["items", index, "materialProductId"],
        });
      }
      seen.add(item.materialProductId);
    });
  });

export type CompositionInput = z.infer<typeof compositionSchema>;

export const compositionListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CompositionListQuery = z.infer<typeof compositionListQuerySchema>;
