"use client";

import { useMemo, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { formatCurrency } from "@/lib/format";
import {
  compositionSchema,
  type CompositionInput,
} from "@/modules/compositions/schemas";
import { createCompositionAction } from "@/modules/compositions/actions";

type ProductOption = { id: string; label: string; unitCost: string | null };

export function CompositionForm({
  finishedProducts,
  materials,
}: {
  finishedProducts: ProductOption[];
  materials: ProductOption[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompositionInput>({
    resolver: zodResolver(compositionSchema),
    defaultValues: {
      finishedProductId: "",
      items: [{ materialProductId: "", quantity: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const materialsById = useMemo(
    () => new Map(materials.map((material) => [material.id, material])),
    [materials],
  );
  const items = useWatch({ control, name: "items" });
  const estimatedCost = items.reduce((total, item) => {
    const material = materialsById.get(item.materialProductId);
    const quantity = Number(item.quantity);
    if (!material?.unitCost || Number.isNaN(quantity)) return total;
    return total + quantity * Number(material.unitCost);
  }, 0);

  function onSubmit(data: CompositionInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createCompositionAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2 sm:max-w-sm">
        <Label htmlFor="finishedProductId">Produto final</Label>
        <Controller
          control={control}
          name="finishedProductId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="finishedProductId" className="w-full">
                <SelectValue placeholder="Selecione o produto final" />
              </SelectTrigger>
              <SelectContent>
                {finishedProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.finishedProductId && (
          <p className="text-sm text-destructive">
            {errors.finishedProductId.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Materiais</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ materialProductId: "", quantity: "" })}
          >
            Adicionar material
          </Button>
        </div>
        {errors.items?.root && (
          <p className="text-sm text-destructive">
            {errors.items.root.message}
          </p>
        )}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_10rem_auto] sm:items-start"
            >
              <div className="space-y-2">
                <Label htmlFor={`items.${index}.materialProductId`}>
                  Material
                </Label>
                <Controller
                  control={control}
                  name={`items.${index}.materialProductId`}
                  render={({ field: selectField }) => (
                    <Select
                      value={selectField.value}
                      onValueChange={selectField.onChange}
                    >
                      <SelectTrigger
                        id={`items.${index}.materialProductId`}
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.items?.[index]?.materialProductId && (
                  <p className="text-sm text-destructive">
                    {errors.items[index]?.materialProductId?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`items.${index}.quantity`}>Quantidade</Label>
                <Input
                  id={`items.${index}.quantity`}
                  inputMode="decimal"
                  placeholder="0.000"
                  {...register(`items.${index}.quantity`)}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>
              <div className="flex items-end sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Custo estimado: <span className="font-medium text-foreground">{formatCurrency(estimatedCost)}</span>
      </p>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
