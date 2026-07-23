import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { BANK_ACCOUNT_TYPE_LABELS } from "@/modules/bank-accounts/schemas";
import { getFinancialSummary } from "@/modules/reports/services";
import { ReportsNav } from "@/modules/reports/components/reports-nav";

export default async function Page() {
  const { rows, totalBalance } = await getFinancialSummary();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Saldo financeiro consolidado das contas ativas.
        </p>
      </div>

      <ReportsNav />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Saldo financeiro</CardTitle>
          <div className="text-sm text-muted-foreground">
            Saldo total:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Saldo inicial</TableHead>
                <TableHead>Saldo atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma conta ativa encontrada.
                  </TableCell>
                </TableRow>
              )}
              {rows.map(({ account, balance }) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.name}
                  </TableCell>
                  <TableCell>
                    {BANK_ACCOUNT_TYPE_LABELS[account.type]}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(account.initialBalance)}
                  </TableCell>
                  <TableCell>{formatCurrency(balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
