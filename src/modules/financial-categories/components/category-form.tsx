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
  FINANCIAL_ENTRY_KINDS,
  FINANCIAL_ENTRY_KIND_LABELS,
  financialCategorySchema,
  type FinancialCategoryInput,
} from "@/modules/financial-categories/schemas";
import { createCategoryAction } from "@/modules/financial-categories/actions";

export function CategoryForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FinancialCategoryInput>({
    resolver: zodResolver(financialCategorySchema),
    defaultValues: { name: "", kind: "INCOME" },
  });

  function onSubmit(data: FinancialCategoryInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createCategoryAction(data);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      reset({ name: "", kind: data.kind });
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-3"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nome da categoria</Label>
        <Input id="name" autoComplete="off" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="kind">Tipo</Label>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="kind" className="w-40">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {FINANCIAL_ENTRY_KINDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {FINANCIAL_ENTRY_KIND_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.kind && (
          <p className="text-sm text-destructive">{errors.kind.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Adicionar categoria"}
      </Button>
      {serverError && (
        <p className="w-full text-sm text-destructive">{serverError}</p>
      )}
    </form>
  );
}
