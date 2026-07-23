import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { UNIT_OF_MEASURE_LABELS } from "@/modules/products/schemas";
import {
  calculateEstimatedCost,
  getComposition,
} from "@/modules/compositions/services";
import { CompositionActiveToggle } from "@/modules/compositions/components/composition-active-toggle";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const composition = await getComposition(id);

  if (!composition) {
    notFound();
  }

  const estimatedCost = calculateEstimatedCost(composition.items);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>
            {composition.finishedProduct.sku} — {composition.finishedProduct.name}
          </CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={composition.active ? "default" : "outline"}>
              {composition.active ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </div>
        <CompositionActiveToggle
          compositionId={composition.id}
          active={composition.active}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Custo unitário</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {composition.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.materialProduct.sku} — {item.materialProduct.name}
                </TableCell>
                <TableCell>
                  {formatQuantity(item.quantity)}{" "}
                  {UNIT_OF_MEASURE_LABELS[item.materialProduct.unit]}
                </TableCell>
                <TableCell>{formatCurrency(item.materialProduct.unitCost)}</TableCell>
                <TableCell>
                  {formatCurrency(
                    item.quantity.times(item.materialProduct.unitCost ?? 0),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm text-muted-foreground">
          Custo estimado total:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(estimatedCost)}
          </span>
        </p>

        <p className="text-xs text-muted-foreground">
          Para alterar os materiais, inative esta composição e cadastre uma
          nova para o mesmo produto final.
        </p>
      </CardContent>
    </Card>
  );
}
