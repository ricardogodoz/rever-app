import { Prisma, type UnitOfMeasure } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type { StockReportQuery } from "@/modules/reports/schemas";
import { getAccountBalances } from "@/modules/financial-entries/services";

export type StockReportRow = {
  productId: string;
  sku: string;
  name: string;
  unit: UnitOfMeasure;
  active: boolean;
  quantity: Prisma.Decimal;
  minStock: Prisma.Decimal | null;
  unitCost: Prisma.Decimal | null;
  estimatedValue: Prisma.Decimal;
  belowMin: boolean;
};

export async function getCurrentStockReport(query: StockReportQuery) {
  const products = await db.product.findMany({
    where: { active: query.status === "active" },
  });

  const balances = await db.stockBalance.groupBy({
    by: ["productId"],
    where: query.warehouseId ? { warehouseId: query.warehouseId } : undefined,
    _sum: { quantity: true },
  });
  const quantityByProduct = new Map(
    balances.map((balance) => [
      balance.productId,
      balance._sum.quantity ?? new Prisma.Decimal(0),
    ]),
  );

  let rows: StockReportRow[] = products.map((product) => {
    const quantity = quantityByProduct.get(product.id) ?? new Prisma.Decimal(0);
    const unitCost = product.unitCost;
    const estimatedValue = unitCost ? quantity.times(unitCost) : new Prisma.Decimal(0);
    const belowMin = product.minStock ? quantity.lessThan(product.minStock) : false;

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      active: product.active,
      quantity,
      minStock: product.minStock,
      unitCost,
      estimatedValue,
      belowMin,
    };
  });

  if (query.belowMinOnly) {
    rows = rows.filter((row) => row.belowMin);
  }

  rows.sort((a, b) => {
    const direction = query.order === "asc" ? 1 : -1;
    if (query.sort === "quantity") {
      return a.quantity.minus(b.quantity).toNumber() * direction;
    }
    return a.name.localeCompare(b.name) * direction;
  });

  const totalEstimatedValue = rows.reduce(
    (total, row) => total.plus(row.estimatedValue),
    new Prisma.Decimal(0),
  );

  return {
    rows,
    totals: {
      itemCount: rows.length,
      totalEstimatedValue,
    },
  };
}

export async function getFinancialSummary() {
  const accounts = await db.bankAccount.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  const balances = await getAccountBalances(accounts.map((account) => account.id));

  const rows = accounts.map((account) => ({
    account,
    balance: balances.get(account.id) ?? account.initialBalance,
  }));

  const totalBalance = rows.reduce(
    (total, row) => total.plus(row.balance),
    new Prisma.Decimal(0),
  );

  return { rows, totalBalance };
}
