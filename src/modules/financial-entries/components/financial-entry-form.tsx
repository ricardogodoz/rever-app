"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  financialEntrySchema,
  type FinancialEntryInput,
} from "@/modules/financial-entries/schemas";

type Option = { id: string; label: string };

type FinancialEntryFormProps = {
  entryId?: string;
  defaultValues?: Partial<FinancialEntryInput>;
  categories: Option[];
  bankAccounts: Option[];
  settledAtLabel: string;
  createAction: (
    input: FinancialEntryInput,
  ) => Promise<{ error: string } | undefined>;
  updateAction: (
    id: string,
    input: FinancialEntryInput,
  ) => Promise<{ error: string } | undefined>;
};

const emptyValues: FinancialEntryInput = {
  description: "",
  categoryId: "",
  bankAccountId: "",
  amount: "",
  competenceDate: "",
  dueDate: "",
  settledAt: "",
  notes: "",
};

export function FinancialEntryForm({
  entryId,
  defaultValues,
  categories,
  bankAccounts,
  settledAtLabel,
  createAction,
  updateAction,
}: FinancialEntryFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const wasSettled = Boolean(defaultValues?.settledAt);
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FinancialEntryInput>({
    resolver: zodResolver(financialEntrySchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });

  function onSubmit(data: FinancialEntryInput) {
    if (wasSettled && !data.settledAt) {
      const confirmed = window.confirm(
        `Remover a ${settledAtLabel.toLowerCase()}? O lançamento voltará a ficar pendente.`,
      );
      if (!confirmed) return;
    }

    setServerError(null);
    startTransition(async () => {
      const result = entryId
        ? await updateAction(entryId, data)
        : await createAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            autoComplete="off"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">
              {errors.amount.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="competenceDate">Data de competência</Label>
          <Input
            id="competenceDate"
            type="date"
            {...register("competenceDate")}
          />
          {errors.competenceDate && (
            <p className="text-sm text-destructive">
              {errors.competenceDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de vencimento</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate && (
            <p className="text-sm text-destructive">
              {errors.dueDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="settledAt">{settledAtLabel}</Label>
          <Input
            id="settledAt"
            type="date"
            max={todayIso}
            {...register("settledAt")}
          />
          {errors.settledAt && (
            <p className="text-sm text-destructive">
              {errors.settledAt.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccountId">
            Conta bancária
            <span className="font-normal text-muted-foreground">
              {" "}
              (obrigatória quando há data preenchida)
            </span>
          </Label>
          <Controller
            control={control}
            name="bankAccountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="bankAccountId" className="w-full">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.bankAccountId && (
            <p className="text-sm text-destructive">
              {errors.bankAccountId.message}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
