import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
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
  BANK_ACCOUNT_TYPE_LABELS,
  bankAccountListQuerySchema,
} from "@/modules/bank-accounts/schemas";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import { getAccountBalances } from "@/modules/financial-entries/services";
import { BankAccountActiveToggle } from "@/modules/bank-accounts/components/bank-account-active-toggle";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "type", label: "Tipo" },
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = bankAccountListQuerySchema.safeParse({
    q: first(rawParams.q),
    status: first(rawParams.status) || undefined,
    sort: first(rawParams.sort) || undefined,
    order: first(rawParams.order) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : bankAccountListQuerySchema.parse({});

  const accounts = await listBankAccounts(query);
  const balances = await getAccountBalances(accounts.map((account) => account.id));
  const totalActiveBalance = accounts
    .filter((account) => account.active)
    .reduce(
      (total, account) =>
        total.plus(balances.get(account.id) ?? new Prisma.Decimal(0)),
      new Prisma.Decimal(0),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Bancos e contas</h1>
          <p className="text-sm text-muted-foreground">
            Contas bancárias cadastradas.
          </p>
        </div>
        <Link
          href="/bancos/novo"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova conta
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1 lg:col-span-2">
              <label htmlFor="q" className="text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Nome ou instituição"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="status"
                name="status"
                defaultValue={query.status ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sort" className="text-sm font-medium">
                Ordenar por
              </label>
              <div className="flex gap-1">
                <select
                  id="sort"
                  name="sort"
                  defaultValue={query.sort}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  name="order"
                  defaultValue={query.order}
                  aria-label="Direção da ordenação"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/bancos"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Limpar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Contas</CardTitle>
          <div className="text-sm text-muted-foreground">
            Saldo total (ativas):{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalActiveBalance)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Instituição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data do saldo inicial</TableHead>
                <TableHead>Saldo atual</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma conta encontrada.
                  </TableCell>
                </TableRow>
              )}
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.name}
                  </TableCell>
                  <TableCell>{account.institution ?? "—"}</TableCell>
                  <TableCell>
                    {BANK_ACCOUNT_TYPE_LABELS[account.type]}
                  </TableCell>
                  <TableCell>
                    {formatDateOnly(account.initialBalanceDate)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      balances.get(account.id) ?? account.initialBalance,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.active ? "default" : "outline"}>
                      {account.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Link
                      href={`/bancos/${account.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Editar
                    </Link>
                    <BankAccountActiveToggle
                      bankAccountId={account.id}
                      active={account.active}
                    />
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
