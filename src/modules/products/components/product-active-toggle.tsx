"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setProductActiveAction } from "@/modules/products/actions";

export function ProductActiveToggle({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      active
        ? "Inativar este produto? Ele deixará de aparecer nas seleções ativas."
        : "Reativar este produto?",
    );
    if (!confirmed) return;

    startTransition(async () => {
      await setProductActiveAction(productId, !active);
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
