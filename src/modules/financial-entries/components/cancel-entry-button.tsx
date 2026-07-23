"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function CancelEntryButton({
  entryId,
  cancelAction,
}: {
  entryId: string;
  cancelAction: (id: string) => Promise<{ error: string } | undefined>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm("Cancelar este lançamento?");
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await cancelAction(entryId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={handleClick}
      >
        Cancelar
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
