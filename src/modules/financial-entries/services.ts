import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  FinancialEntryInput,
  FinancialEntryListQuery,
} from "@/modules/financial-entries/schemas";
import type { FinancialEntryKind } from "@/modules/financial-categories/schemas";

export class FinancialEntryServiceError extends Error {}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function listEntries(
  kind: FinancialEntryKind,
  query: FinancialEntryListQuery,
) {
  const where: Prisma.FinancialEntryWhereInput = { kind };

  if (query.situation === "pending") {
    where.settledAt = null;
    where.cancelledAt = null;
  } else if (query.situation === "settled") {
    where.settledAt = { not: null };
    where.cancelledAt = null;
  } else if (query.situation === "cancelled") {
    where.cancelledAt = { not: null };
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.bankAccountId) {
    where.bankAccountId = query.bankAccountId;
  }
  if (query.dateFrom || query.dateTo) {
    where.competenceDate = {
      ...(query.dateFrom ? { gte: toDate(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: toDate(query.dateTo) } : {}),
    };
  }

  return db.financialEntry.findMany({
    where,
    include: { category: true, bankAccount: true },
    orderBy: [{ competenceDate: "desc" }, { createdAt: "desc" }],
  });
}

export function getEntry(id: string) {
  return db.financialEntry.findUnique({
    where: { id },
    include: { category: true, bankAccount: true },
  });
}

async function assertCategory(kind: FinancialEntryKind, categoryId: string) {
  const category = await db.financialCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category || !category.active || category.kind !== kind) {
    throw new FinancialEntryServiceError("Categoria inválida ou inativa.");
  }
}

async function assertBankAccount(bankAccountId: string) {
  const bankAccount = await db.bankAccount.findUnique({
    where: { id: bankAccountId },
  });
  if (!bankAccount || !bankAccount.active) {
    throw new FinancialEntryServiceError("Conta bancária inválida ou inativa.");
  }
}

function assertSettlementConsistency(input: FinancialEntryInput) {
  if (input.settledAt && !input.bankAccountId) {
    throw new FinancialEntryServiceError(
      "Conta bancária é obrigatória quando há data de recebimento/pagamento.",
    );
  }
}

export async function createEntry(
  kind: FinancialEntryKind,
  input: FinancialEntryInput,
  userId: string,
) {
  assertSettlementConsistency(input);
  await assertCategory(kind, input.categoryId);
  if (input.bankAccountId) {
    await assertBankAccount(input.bankAccountId);
  }

  return db.financialEntry.create({
    data: {
      kind,
      origin: "SIMPLE",
      description: input.description,
      categoryId: input.categoryId,
      bankAccountId: input.bankAccountId ?? null,
      amount: input.amount,
      competenceDate: toDate(input.competenceDate),
      dueDate: input.dueDate ? toDate(input.dueDate) : null,
      settledAt: input.settledAt ? toDate(input.settledAt) : null,
      createdById: userId,
      updatedById: userId,
    },
  });
}

export async function updateEntry(
  id: string,
  kind: FinancialEntryKind,
  input: FinancialEntryInput,
  userId: string,
) {
  const existing = await db.financialEntry.findUnique({ where: { id } });
  if (!existing || existing.kind !== kind) {
    throw new FinancialEntryServiceError("Lançamento não encontrado.");
  }
  if (existing.cancelledAt) {
    throw new FinancialEntryServiceError(
      "Não é possível editar um lançamento cancelado.",
    );
  }

  assertSettlementConsistency(input);
  await assertCategory(kind, input.categoryId);
  if (input.bankAccountId) {
    await assertBankAccount(input.bankAccountId);
  }

  return db.financialEntry.update({
    where: { id },
    data: {
      description: input.description,
      categoryId: input.categoryId,
      bankAccountId: input.bankAccountId ?? null,
      amount: input.amount,
      competenceDate: toDate(input.competenceDate),
      dueDate: input.dueDate ? toDate(input.dueDate) : null,
      settledAt: input.settledAt ? toDate(input.settledAt) : null,
      updatedById: userId,
    },
  });
}

export async function cancelEntry(
  id: string,
  kind: FinancialEntryKind,
  userId: string,
) {
  const existing = await db.financialEntry.findUnique({ where: { id } });
  if (!existing || existing.kind !== kind) {
    throw new FinancialEntryServiceError("Lançamento não encontrado.");
  }
  if (existing.cancelledAt) {
    throw new FinancialEntryServiceError("Este lançamento já está cancelado.");
  }

  return db.financialEntry.update({
    where: { id },
    data: { cancelledAt: new Date(), updatedById: userId },
  });
}

export async function getAccountBalances(accountIds?: string[]) {
  const accounts = await db.bankAccount.findMany({
    where: accountIds ? { id: { in: accountIds } } : undefined,
  });

  const sums = await db.financialEntry.groupBy({
    by: ["bankAccountId", "kind"],
    where: {
      settledAt: { not: null },
      cancelledAt: null,
      bankAccountId: accountIds ? { in: accountIds } : { not: null },
    },
    _sum: { amount: true },
  });

  const balances = new Map<string, Prisma.Decimal>();
  for (const account of accounts) {
    const income =
      sums.find((s) => s.bankAccountId === account.id && s.kind === "INCOME")
        ?._sum.amount ?? new Prisma.Decimal(0);
    const expense =
      sums.find((s) => s.bankAccountId === account.id && s.kind === "EXPENSE")
        ?._sum.amount ?? new Prisma.Decimal(0);
    balances.set(
      account.id,
      account.initialBalance.plus(income).minus(expense),
    );
  }

  return balances;
}

export async function getAccountStatement(bankAccountId: string) {
  const account = await db.bankAccount.findUnique({
    where: { id: bankAccountId },
  });
  if (!account) {
    throw new FinancialEntryServiceError("Conta bancária não encontrada.");
  }

  const entries = await db.financialEntry.findMany({
    where: { bankAccountId, settledAt: { not: null }, cancelledAt: null },
    include: { category: true },
    orderBy: [{ settledAt: "asc" }, { createdAt: "asc" }],
  });

  let runningBalance = account.initialBalance;
  const rows = entries.map((entry) => {
    runningBalance =
      entry.kind === "INCOME"
        ? runningBalance.plus(entry.amount)
        : runningBalance.minus(entry.amount);
    return { entry, balance: runningBalance };
  });

  return {
    account,
    openingBalance: account.initialBalance,
    closingBalance: runningBalance,
    rows,
  };
}
