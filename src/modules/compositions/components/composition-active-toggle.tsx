"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setCompositionActiveAction } from "@/modules/compositions/actions";

export function CompositionActiveToggle({
  compositionId,
  active,
}: {
  compositionId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const message = active
      ? "Inativar esta composição?"
      : "Reativar esta composição?";
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await setCompositionActiveAction(
        compositionId,
        !active,
      );
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
