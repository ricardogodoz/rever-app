import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinancialEntryForm } from "@/modules/financial-entries/components/financial-entry-form";
import { listCategories } from "@/modules/financial-categories/services";
import { listBankAccounts } from "@/modules/bank-accounts/services";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/modules/expenses/actions";

export default async function Page() {
  const [categories, bankAccounts] = await Promise.all([
    listCategories({ kind: "EXPENSE", status: "active" }),
    listBankAccounts({ status: "active", sort: "name", order: "asc" }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova despesa</CardTitle>
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
          settledAtLabel="Data de pagamento"
          createAction={createExpenseAction}
          updateAction={updateExpenseAction}
        />
      </CardContent>
    </Card>
  );
}
