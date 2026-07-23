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
  BANK_ACCOUNT_TYPES,
  BANK_ACCOUNT_TYPE_LABELS,
  bankAccountSchema,
  type BankAccountInput,
} from "@/modules/bank-accounts/schemas";
import {
  createBankAccountAction,
  updateBankAccountAction,
} from "@/modules/bank-accounts/actions";

type BankAccountFormProps = {
  bankAccountId?: string;
  defaultValues?: Partial<BankAccountInput>;
};

const emptyValues: BankAccountInput = {
  name: "",
  institution: "",
  type: "CHECKING",
  initialBalance: "",
  initialBalanceDate: "",
  notes: "",
};

export function BankAccountForm({
  bankAccountId,
  defaultValues,
}: BankAccountFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });

  function onSubmit(data: BankAccountInput) {
    setServerError(null);
    startTransition(async () => {
      const result = bankAccountId
        ? await updateBankAccountAction(bankAccountId, data)
        : await createBankAccountAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da conta</Label>
          <Input id="name" autoComplete="off" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution">Instituição</Label>
          <Input
            id="institution"
            autoComplete="off"
            {...register("institution")}
          />
          {errors.institution && (
            <p className="text-sm text-destructive">
              {errors.institution.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_ACCOUNT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {BANK_ACCOUNT_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Saldo inicial (R$)</Label>
          <Input
            id="initialBalance"
            inputMode="decimal"
            placeholder="0.00"
            {...register("initialBalance")}
          />
          {errors.initialBalance && (
            <p className="text-sm text-destructive">
              {errors.initialBalance.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialBalanceDate">Data do saldo inicial</Label>
          <Input
            id="initialBalanceDate"
            type="date"
            {...register("initialBalanceDate")}
          />
          {errors.initialBalanceDate && (
            <p className="text-sm text-destructive">
              {errors.initialBalanceDate.message}
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
