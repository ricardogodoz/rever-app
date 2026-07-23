import { z } from "zod";

export const BANK_ACCOUNT_TYPES = [
  "CHECKING",
  "SAVINGS",
  "CASH",
  "OTHER",
] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];

export const BANK_ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  CASH: "Caixa / Dinheiro",
  OTHER: "Outro",
};

export const bankAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Informe o nome da conta." })
    .max(200, { message: "Máximo de 200 caracteres." }),
  institution: z
    .string()
    .trim()
    .max(200, { message: "Máximo de 200 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  type: z.enum(BANK_ACCOUNT_TYPES, { message: "Selecione o tipo." }),
  initialBalance: z
    .string()
    .trim()
    .min(1, { message: "Informe o saldo inicial." })
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Saldo inválido. Use até 2 casas decimais.",
    }),
  initialBalanceDate: z
    .string()
    .trim()
    .min(1, { message: "Informe a data do saldo inicial." })
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Data inválida.",
    }),
  notes: z
    .string()
    .trim()
    .max(1000, { message: "Máximo de 1000 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;

export const bankAccountListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["name", "type"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type BankAccountListQuery = z.infer<typeof bankAccountListQuerySchema>;
