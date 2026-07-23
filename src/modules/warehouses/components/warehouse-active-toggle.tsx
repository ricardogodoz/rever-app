"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setWarehouseActiveAction } from "@/modules/warehouses/actions";

export function WarehouseActiveToggle({
  warehouseId,
  active,
  hasStock,
}: {
  warehouseId: string;
  active: boolean;
  hasStock?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const message =
      active && hasStock
        ? "Este armazém possui saldo em estoque. Inativar mesmo assim?"
        : active
          ? "Inativar este armazém?"
          : "Reativar este armazém?";
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await setWarehouseActiveAction(warehouseId, !active);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={active ? "destructive" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? "Aguarde..." : active ? "Inativar" : "Reativar"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
