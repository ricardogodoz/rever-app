import type { Prisma } from "@/generated/prisma/client";

type Decimalish = Prisma.Decimal | number | string | null | undefined;

function toNumber(value: Decimalish): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "object" ? value.toNumber() : Number(value);
}

export function formatCurrency(value: Decimalish): string {
  const number = toNumber(value);
  if (number === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

export function formatQuantity(value: Decimalish): string {
  const number = toNumber(value);
  if (number === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(number);
}
