import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import {
  financialEntryListQuerySchema,
  getEntrySituationLabel,
} from "@/modules/financial-entries/schemas";
import { listEntries } from "@/modules/financial-entries/services";
import { listCategories } from "@/modules/financial-categories/services";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import { CancelEntryButton } from "@/modules/financial-entries/components/cancel-entry-button";
import { cancelIncomeAction } from "@/modules/income/actions";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function badgeVariant(entry: {
  settledAt: Date | null;
  cancelledAt: Date | null;
}) {
  if (entry.cancelledAt) return "outline" as const;
  if (entry.settledAt) return "default" as const;
  return "secondary" as const;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = financialEntryListQuerySchema.safeParse({
    situation: first(rawParams.situation) || undefined,
    categoryId: first(rawParams.categoryId) || undefined,
    bankAccountId: first(rawParams.bankAccountId) || undefined,
    dateFrom: first(rawParams.dateFrom) || undefined,
    dateTo: first(rawParams.dateTo) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : financialEntryListQuerySchema.parse({});

  const [entries, categories, bankAccounts] = await Promise.all([
    listEntries("INCOME", query),
    listCategories({ kind: "INCOME" }),
    listBankAccounts({ sort: "name", order: "asc" }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Receitas</h1>
          <p className="text-sm text-muted-foreground">
            Lançamentos de receita simples.
          </p>
        </div>
        <Link
          href="/receitas/novo"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova receita
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-1">
              <label htmlFor="situation" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="situation"
                name="situation"
                defaultValue={query.situation ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todas</option>
                <option value="pending">Pendente</option>
                <option value="settled">Recebida</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Categoria
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={query.categoryId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="bankAccountId" className="text-sm font-medium">
                Conta
              </label>
              <select
                id="bankAccountId"
                name="bankAccountId"
                defaultValue={query.bankAccountId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todas</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="dateFrom" className="text-sm font-medium">
                Competência de
              </label>
              <input
                id="dateFrom"
                name="dateFrom"
                type="date"
                defaultValue={query.dateFrom ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="dateTo" className="text-sm font-medium">
                Competência até
              </label>
              <input
                id="dateTo"
                name="dateTo"
                type="date"
                defaultValue={query.dateTo ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex items-end gap-2 lg:col-span-5">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/receitas"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Limpar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Recebimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma receita encontrada.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <Link href={`/receitas/${entry.id}`} className="hover:underline">
                      {entry.description}
                    </Link>
                  </TableCell>
                  <TableCell>{entry.category.name}</TableCell>
                  <TableCell>{entry.bankAccount?.name ?? "—"}</TableCell>
                  <TableCell>{formatDateOnly(entry.competenceDate)}</TableCell>
                  <TableCell>{formatDateOnly(entry.settledAt)}</TableCell>
                  <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(entry)}>
                      {getEntrySituationLabel("INCOME", entry)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!entry.cancelledAt && (
                      <CancelEntryButton
                        entryId={entry.id}
                        cancelAction={cancelIncomeAction}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
