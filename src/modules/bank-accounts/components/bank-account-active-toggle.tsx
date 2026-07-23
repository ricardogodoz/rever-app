"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setBankAccountActiveAction } from "@/modules/bank-accounts/actions";

export function BankAccountActiveToggle({
  bankAccountId,
  active,
}: {
  bankAccountId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      active ? "Inativar esta conta bancária?" : "Reativar esta conta bancária?",
    );
    if (!confirmed) return;

    startTransition(async () => {
      await setBankAccountActiveAction(bankAccountId, !active);
    });
  }

  return (
    <Button
      type="button"
      variant={active ? "destructive" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? "Aguarde..." : active ? "Inativar" : "Reativar"}
    </Button>
  );
}
