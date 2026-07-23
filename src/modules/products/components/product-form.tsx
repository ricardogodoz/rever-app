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
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  UNITS_OF_MEASURE,
  UNIT_OF_MEASURE_LABELS,
  productSchema,
  type ProductInput,
} from "@/modules/products/schemas";
import {
  createProductAction,
  updateProductAction,
} from "@/modules/products/actions";

type ProductFormProps = {
  productId?: string;
  defaultValues?: Partial<ProductInput>;
};

const emptyValues: ProductInput = {
  sku: "",
  name: "",
  type: "MATERIAL",
  unit: "UNIT",
  description: "",
  barcode: "",
  unitCost: "",
  defaultPrice: "",
  minStock: "",
  imageUrl: "",
  notes: "",
};

export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });

  function onSubmit(data: ProductInput) {
    setServerError(null);
    startTransition(async () => {
      const result = productId
        ? await updateProductAction(productId, data)
        : await createProductAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" autoComplete="off" {...register("sku")} />
          {errors.sku && (
            <p className="text-sm text-destructive">{errors.sku.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" autoComplete="off" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
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
                  {PRODUCT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PRODUCT_TYPE_LABELS[value]}
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
          <Label htmlFor="unit">Unidade</Label>
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="unit" className="w-full">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS_OF_MEASURE.map((value) => (
                    <SelectItem key={value} value={value}>
                      {UNIT_OF_MEASURE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.unit && (
            <p className="text-sm text-destructive">{errors.unit.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Código de barras</Label>
          <Input id="barcode" autoComplete="off" {...register("barcode")} />
          {errors.barcode && (
            <p className="text-sm text-destructive">
              {errors.barcode.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Custo unitário (R$)</Label>
          <Input
            id="unitCost"
            inputMode="decimal"
            placeholder="0.00"
            {...register("unitCost")}
          />
          {errors.unitCost && (
            <p className="text-sm text-destructive">
              {errors.unitCost.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultPrice">Preço de venda padrão (R$)</Label>
          <Input
            id="defaultPrice"
            inputMode="decimal"
            placeholder="0.00"
            {...register("defaultPrice")}
          />
          {errors.defaultPrice && (
            <p className="text-sm text-destructive">
              {errors.defaultPrice.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStock">Estoque mínimo</Label>
          <Input
            id="minStock"
            inputMode="decimal"
            placeholder="0.000"
            {...register("minStock")}
          />
          {errors.minStock && (
            <p className="text-sm text-destructive">
              {errors.minStock.message}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">URL da imagem</Label>
          <Input id="imageUrl" autoComplete="off" {...register("imageUrl")} />
          {errors.imageUrl && (
            <p className="text-sm text-destructive">
              {errors.imageUrl.message}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
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
