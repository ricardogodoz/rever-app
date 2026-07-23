import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinancialEntryForm } from "@/modules/financial-entries/components/financial-entry-form";
import { listCategories } from "@/modules/financial-categories/services";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import { createIncomeAction, updateIncomeAction } from "@/modules/income/actions";

export default async function Page() {
  const [categories, bankAccounts] = await Promise.all([
    listCategories({ kind: "INCOME", status: "active" }),
    listBankAccounts({ status: "active", sort: "name", order: "asc" }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova receita</CardTitle>
      </CardHeader>
      <CardContent>
        <FinancialEntryForm
          categories={categories.map((category) => ({
            id: category.id,
            label: category.name,
          }))}
          bankAccounts={bankAccounts.map((account) => ({
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
