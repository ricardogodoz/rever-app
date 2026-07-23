"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reverseStockMovementAction } from "@/modules/stock/actions";

export function ReverseMovementButton({ movementId }: { movementId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm(
      "Estornar esta movimentação? Uma movimentação inversa será registrada.",
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await reverseStockMovementAction(movementId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? "Aguarde..." : "Estornar"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
