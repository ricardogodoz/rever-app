import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BankAccountForm } from "@/modules/bank-accounts/components/bank-account-form";
import { getBankAccount } from "@/modules/bank-accounts/services";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getBankAccount(id);

  if (!account) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar conta bancária</CardTitle>
      </CardHeader>
      <CardContent>
        <BankAccountForm
          bankAccountId={account.id}
          defaultValues={{
            name: account.name,
            institution: account.institution ?? "",
            type: account.type,
            initialBalance: account.initialBalance.toString(),
            initialBalanceDate: account.initialBalanceDate
              .toISOString()
              .slice(0, 10),
            notes: account.notes ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
