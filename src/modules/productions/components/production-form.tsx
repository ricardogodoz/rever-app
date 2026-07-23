"use client";

import { useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatQuantity } from "@/lib/format";
import { UNIT_OF_MEASURE_LABELS, type UnitOfMeasure } from "@/modules/products/schemas";
import {
  productionSchema,
  type ProductionInput,
} from "@/modules/productions/schemas";
import { createProductionAction } from "@/modules/productions/actions";

type Option = { id: string; label: string };
type MaterialPreview = {
  materialProductId: string;
  label: string;
  quantityPerUnit: string;
  unit: UnitOfMeasure;
};

export function ProductionForm({
  finishedProducts,
  materialsByFinishedProduct,
  warehouses,
}: {
  finishedProducts: Option[];
  materialsByFinishedProduct: Record<string, MaterialPreview[]>;
  warehouses: Option[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductionInput>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      finishedProductId: "",
      quantity: "",
      sourceWarehouseId: "",
      destinationWarehouseId: "",
      notes: "",
    },
  });

  const finishedProductId = useWatch({ control, name: "finishedProductId" });
  const quantity = useWatch({ control, name: "quantity" });

  const materials = useMemo(
    () => materialsByFinishedProduct[finishedProductId] ?? [],
    [materialsByFinishedProduct, finishedProductId],
  );
  const parsedQuantity = Number(quantity);

  function onSubmit(data: ProductionInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createProductionAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {finishedProducts.length === 0 && (
        <p className="text-sm text-destructive">
          Nenhum produto final com composição ativa. Cadastre uma composição
          em &quot;Composição de produtos&quot; antes de registrar uma
          produção.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade a produzir</Label>
          <Input
            id="quantity"
            inputMode="decimal"
            placeholder="0.000"
            {...register("quantity")}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceWarehouseId">Armazém de origem (materiais)</Label>
          <Controller
            control={control}
            name="sourceWarehouseId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sourceWarehouseId" className="w-full">
                  <SelectValue placeholder="Selecione o armazém" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sourceWarehouseId && (
            <p className="text-sm text-destructive">
              {errors.sourceWarehouseId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationWarehouseId">
            Armazém de destino (produto final)
          </Label>
          <Controller
            control={control}
            name="destinationWarehouseId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="destinationWarehouseId" className="w-full">
                  <SelectValue placeholder="Selecione o armazém" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.destinationWarehouseId && (
            <p className="text-sm text-destructive">
              {errors.destinationWarehouseId.message}
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

      {finishedProductId && (
        <div className="space-y-2">
          <Label>Materiais necessários</Label>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este produto final não possui composição ativa.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Qtd. por unidade</TableHead>
                  <TableHead>Qtd. necessária</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.materialProductId}>
                    <TableCell className="font-medium">
                      {material.label}
                    </TableCell>
                    <TableCell>
                      {formatQuantity(material.quantityPerUnit)}{" "}
                      {UNIT_OF_MEASURE_LABELS[material.unit]}
                    </TableCell>
                    <TableCell>
                      {Number.isNaN(parsedQuantity) || parsedQuantity <= 0
                        ? "—"
                        : `${formatQuantity(
                            Number(material.quantityPerUnit) * parsedQuantity,
                          )} ${UNIT_OF_MEASURE_LABELS[material.unit]}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
