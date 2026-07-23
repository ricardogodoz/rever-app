import { z } from "zod";

export const FINANCIAL_ENTRY_KINDS = ["INCOME", "EXPENSE"] as const;
export type FinancialEntryKind = (typeof FINANCIAL_ENTRY_KINDS)[number];

export const FINANCIAL_ENTRY_KIND_LABELS: Record<FinancialEntryKind, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export const financialCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Informe o nome." })
    .max(100, { message: "Máximo de 100 caracteres." }),
  kind: z.enum(FINANCIAL_ENTRY_KINDS, { message: "Selecione o tipo." }),
});

export type FinancialCategoryInput = z.infer<typeof financialCategorySchema>;
