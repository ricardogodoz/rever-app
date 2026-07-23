import { z } from "zod";
import type { FinancialEntryKind } from "@/modules/financial-categories/schemas";

const amountPattern = /^\d+(\.\d{1,2})?$/;

function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateField(message: string) {
  return z
    .string()
    .trim()
    .min(1, { message })
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Data inválida.",
    });
}

function optionalDateField(invalidMessage: string, futureMessage: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
      message: invalidMessage,
    })
    .refine((value) => value === undefined || value <= todayInSaoPaulo(), {
      message: futureMessage,
    });
}

export const financialEntrySchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, { message: "Informe a descrição." })
      .max(300, { message: "Máximo de 300 caracteres." }),
    categoryId: z.string().trim().min(1, { message: "Selecione a categoria." }),
    bankAccountId: z
      .string()
      .trim()
      .transform((value) => (value === "" ? undefined : value))
      .optional(),
    amount: z
      .string()
      .trim()
      .min(1, { message: "Informe o valor." })
      .refine((value) => amountPattern.test(value), {
        message: "Valor inválido. Use até 2 casas decimais.",
      })
      .refine((value) => Number(value) > 0, {
        message: "O valor deve ser maior que zero.",
      }),
    competenceDate: dateField("Informe a data de competência."),
    dueDate: z
      .string()
      .trim()
      .transform((value) => (value === "" ? undefined : value))
      .optional()
      .refine((value) => value === undefined || !Number.isNaN(Date.parse(value)), {
        message: "Data de vencimento inválida.",
      }),
    settledAt: optionalDateField(
      "Data inválida.",
      "Não é possível informar uma data futura.",
    ),
    notes: z
      .string()
      .trim()
      .max(1000, { message: "Máximo de 1000 caracteres." })
      .transform((value) => (value === "" ? undefined : value))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.settledAt && !data.bankAccountId) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountId"],
        message: "Selecione a conta bancária (obrigatória quando há data preenchida).",
      });
    }
  });

export type FinancialEntryInput = z.infer<typeof financialEntrySchema>;

export const financialEntryListQuerySchema = z.object({
  situation: z.enum(["pending", "settled", "cancelled"]).optional(),
  categoryId: z.string().trim().optional(),
  bankAccountId: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});

export type FinancialEntryListQuery = z.infer<
  typeof financialEntryListQuerySchema
>;

export function getEntrySituationLabel(
  kind: FinancialEntryKind,
  entry: { settledAt: Date | string | null; cancelledAt: Date | string | null },
): string {
  if (entry.cancelledAt) return "Cancelada";
  if (entry.settledAt) return kind === "INCOME" ? "Recebida" : "Paga";
  return "Pendente";
}
