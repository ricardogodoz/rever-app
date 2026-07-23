"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  warehouseSchema,
  type WarehouseInput,
} from "@/modules/warehouses/schemas";
import {
  createWarehouseAction,
  updateWarehouseAction,
} from "@/modules/warehouses/actions";

type WarehouseFormProps = {
  warehouseId?: string;
  defaultValues?: Partial<WarehouseInput>;
  lockDefault?: boolean;
};

const emptyValues: WarehouseInput = {
  code: "",
  name: "",
  location: "",
  isDefault: false,
};

export function WarehouseForm({
  warehouseId,
  defaultValues,
  lockDefault,
}: WarehouseFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WarehouseInput>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });

  function onSubmit(data: WarehouseInput) {
    setServerError(null);
    startTransition(async () => {
      const result = warehouseId
        ? await updateWarehouseAction(warehouseId, data)
        : await createWarehouseAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input id="code" autoComplete="off" {...register("code")} />
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" autoComplete="off" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Localização</Label>
          <Input id="location" autoComplete="off" {...register("location")} />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <Checkbox
                id="isDefault"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={lockDefault}
              />
            )}
          />
          <Label htmlFor="isDefault" className="font-normal">
            Armazém padrão
          </Label>
        </div>
        {lockDefault && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Este é o armazém padrão atual. Para trocar, marque outro armazém
            como padrão.
          </p>
        )}
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
