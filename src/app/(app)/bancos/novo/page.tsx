import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BankAccountForm } from "@/modules/bank-accounts/components/bank-account-form";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova conta bancária</CardTitle>
      </CardHeader>
      <CardContent>
        <BankAccountForm />
      </CardContent>
    </Card>
  );
}
