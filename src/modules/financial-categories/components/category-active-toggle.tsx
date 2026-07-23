"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setCategoryActiveAction } from "@/modules/financial-categories/actions";

export function CategoryActiveToggle({
  categoryId,
  active,
}: {
  categoryId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      active ? "Inativar esta categoria?" : "Reativar esta categoria?",
    );
    if (!confirmed) return;

    startTransition(async () => {
      await setCategoryActiveAction(categoryId, !active);
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
