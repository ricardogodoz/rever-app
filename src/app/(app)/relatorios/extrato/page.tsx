import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import { getAccountStatement } from "@/modules/financial-entries/services";
import { FINANCIAL_ENTRY_KIND_LABELS } from "@/modules/financial-categories/schemas";
import { ReportsNav } from "@/modules/reports/components/reports-nav";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const accounts = await listBankAccounts({ sort: "name", order: "asc" });
  const selectedId = first(rawParams.bankAccountId) || accounts[0]?.id;
  const statement = selectedId ? await getAccountStatement(selectedId) : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Extrato financeiro por conta (lançamentos já recebidos/pagos).
        </p>
      </div>

      <ReportsNav />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtro</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label htmlFor="bankAccountId" className="text-sm font-medium">
                Conta
              </label>
              <select
                id="bankAccountId"
                name="bankAccountId"
                defaultValue={selectedId ?? ""}
                className="h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Filtrar</Button>
          </form>
        </CardContent>
      </Card>

      {!statement && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma conta bancária cadastrada.
          </CardContent>
        </Card>
      )}

      {statement && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Extrato — {statement.account.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Saldo inicial: {formatCurrency(statement.openingBalance)} ·
              Saldo atual:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(statement.closingBalance)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Nenhum lançamento recebido/pago para esta conta.
                    </TableCell>
                  </TableRow>
                )}
                {statement.rows.map(({ entry, balance }) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDateOnly(entry.settledAt)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.category.name}</TableCell>
                    <TableCell>
                      <Badge variant={entry.kind === "INCOME" ? "default" : "outline"}>
                        {FINANCIAL_ENTRY_KIND_LABELS[entry.kind]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.kind === "EXPENSE" ? "-" : ""}
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell>{formatCurrency(balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
