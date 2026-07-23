import { z } from "zod";

export const MANUAL_MOVEMENT_TYPES = [
  "MANUAL_IN",
  "MANUAL_OUT",
  "ADJUST_IN",
  "ADJUST_OUT",
] as const;
export type ManualMovementType = (typeof MANUAL_MOVEMENT_TYPES)[number];

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  MANUAL_IN: "Entrada manual",
  MANUAL_OUT: "Saída manual",
  ADJUST_IN: "Ajuste de entrada",
  ADJUST_OUT: "Ajuste de saída",
  TRANSFER_OUT: "Transferência (saída)",
  TRANSFER_IN: "Transferência (entrada)",
  PRODUCTION_CONSUME: "Consumo de produção",
  PRODUCTION_IN: "Entrada de produção",
  SALE_OUT: "Saída por venda",
  REVERSAL: "Estorno",
};

const quantityPattern = /^\d+(\.\d{1,3})?$/;

export const stockMovementSchema = z.object({
  type: z.enum(MANUAL_MOVEMENT_TYPES, { message: "Selecione o tipo." }),
  productId: z.string().trim().min(1, { message: "Selecione o produto." }),
  warehouseId: z.string().trim().min(1, { message: "Selecione o armazém." }),
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
  reason: z
    .string()
    .trim()
    .min(1, { message: "Informe o motivo." })
    .max(300, { message: "Máximo de 300 caracteres." }),
  notes: z
    .string()
    .trim()
    .max(1000, { message: "Máximo de 1000 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;

export const stockMovementListQuerySchema = z.object({
  productId: z.string().trim().optional(),
  warehouseId: z.string().trim().optional(),
  type: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});

export type StockMovementListQuery = z.infer<
  typeof stockMovementListQuerySchema
>;
