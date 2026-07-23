import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import { FinancialEntryForm } from "@/modules/financial-entries/components/financial-entry-form";
import { CancelEntryButton } from "@/modules/financial-entries/components/cancel-entry-button";
import { getEntrySituationLabel } from "@/modules/financial-entries/schemas";
import { getEntry } from "@/modules/financial-entries/services";
import { listCategories } from "@/modules/financial-categories/services";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import {
  createIncomeAction,
  updateIncomeAction,
  cancelIncomeAction,
} from "@/modules/income/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getEntry(id);

  if (!entry || entry.kind !== "INCOME") {
    notFound();
  }

  if (entry.cancelledAt) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{entry.description}</CardTitle>
          <Badge variant="outline">
            {getEntrySituationLabel("INCOME", entry)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Categoria</dt>
              <dd>{entry.category.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Conta</dt>
              <dd>{entry.bankAccount?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Valor</dt>
              <dd>{formatCurrency(entry.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Competência</dt>
              <dd>{formatDateOnly(entry.competenceDate)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Vencimento</dt>
              <dd>{formatDateOnly(entry.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Recebimento</dt>
              <dd>{formatDateOnly(entry.settledAt)}</dd>
            </div>
            {entry.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">Observações</dt>
                <dd>{entry.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    );
  }

  const [categories, bankAccounts] = await Promise.all([
    listCategories({ kind: "INCOME", status: "active" }),
    listBankAccounts({ status: "active", sort: "name", order: "asc" }),
  ]);

  const categoryOptions = categories.some((c) => c.id === entry.categoryId)
    ? categories
    : [entry.category, ...categories];
  const bankAccountOptions =
    entry.bankAccount && !bankAccounts.some((a) => a.id === entry.bankAccountId)
      ? [entry.bankAccount, ...bankAccounts]
      : bankAccounts;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Editar receita</CardTitle>
        <CancelEntryButton entryId={entry.id} cancelAction={cancelIncomeAction} />
      </CardHeader>
      <CardContent>
        <FinancialEntryForm
          entryId={entry.id}
          defaultValues={{
            description: entry.description,
            categoryId: entry.categoryId,
            bankAccountId: entry.bankAccountId ?? "",
            amount: entry.amount.toString(),
            competenceDate: entry.competenceDate.toISOString().slice(0, 10),
            dueDate: entry.dueDate
              ? entry.dueDate.toISOString().slice(0, 10)
              : "",
            settledAt: entry.settledAt
              ? entry.settledAt.toISOString().slice(0, 10)
              : "",
            notes: entry.notes ?? "",
          }}
          categories={categoryOptions.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          bankAccounts={bankAccountOptions.map((account) => ({
            id: account.id,
            label: account.name,
          }))}
          settledAtLabel="Data de recebimento"
          createAction={createIncomeAction}
          updateAction={updateIncomeAction}
        />
      </CardContent>
    </Card>
  );
}
