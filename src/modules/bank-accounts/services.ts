import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type {
  BankAccountInput,
  BankAccountListQuery,
} from "@/modules/bank-accounts/schemas";

export class BankAccountServiceError extends Error {}

export async function listBankAccounts(query: BankAccountListQuery) {
  const where: Prisma.BankAccountWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { institution: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.status) {
    where.active = query.status === "active";
  }

  return db.bankAccount.findMany({
    where,
    orderBy: { [query.sort]: query.order },
  });
}

export function getBankAccount(id: string) {
  return db.bankAccount.findUnique({ where: { id } });
}

export async function createBankAccount(
  input: BankAccountInput,
  userId: string,
) {
  return db.bankAccount.create({
    data: {
      name: input.name,
      institution: input.institution ?? null,
      type: input.type,
      initialBalance: input.initialBalance,
      initialBalanceDate: new Date(`${input.initialBalanceDate}T00:00:00.000Z`),
      notes: input.notes ?? null,
      createdById: userId,
      updatedById: userId,
    },
  });
}

export async function updateBankAccount(
  id: string,
  input: BankAccountInput,
  userId: string,
) {
  const existing = await db.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    throw new BankAccountServiceError("Conta bancária não encontrada.");
  }

  return db.bankAccount.update({
    where: { id },
    data: {
      name: input.name,
      institution: input.institution ?? null,
      type: input.type,
      initialBalance: input.initialBalance,
      initialBalanceDate: new Date(`${input.initialBalanceDate}T00:00:00.000Z`),
      notes: input.notes ?? null,
      updatedById: userId,
    },
  });
}

export async function setBankAccountActive(
  id: string,
  active: boolean,
  userId: string,
) {
  const existing = await db.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    throw new BankAccountServiceError("Conta bancária não encontrada.");
  }

  return db.bankAccount.update({
    where: { id },
    data: { active, updatedById: userId },
  });
}
