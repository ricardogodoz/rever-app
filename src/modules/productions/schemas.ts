import { z } from "zod";

const quantityPattern = /^\d+(\.\d{1,3})?$/;

export const PRODUCTION_STATUSES = ["DRAFT", "COMPLETED", "CANCELLED"] as const;
export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  DRAFT: "Rascunho",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export const productionSchema = z.object({
  finishedProductId: z
    .string()
    .trim()
    .min(1, { message: "Selecione o produto final." }),
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
  sourceWarehouseId: z
    .string()
    .trim()
    .min(1, { message: "Selecione o armazém de origem dos materiais." }),
  destinationWarehouseId: z
    .string()
    .trim()
    .min(1, { message: "Selecione o armazém de destino do produto final." }),
  notes: z
    .string()
    .trim()
    .max(1000, { message: "Máximo de 1000 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export type ProductionInput = z.infer<typeof productionSchema>;

export const productionListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(PRODUCTION_STATUSES).optional(),
});

export type ProductionListQuery = z.infer<typeof productionListQuerySchema>;
