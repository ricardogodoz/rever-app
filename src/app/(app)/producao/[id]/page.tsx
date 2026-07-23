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
import { formatDateTime, formatQuantity } from "@/lib/format";
import { UNIT_OF_MEASURE_LABELS } from "@/modules/products/schemas";
import { PRODUCTION_STATUS_LABELS } from "@/modules/productions/schemas";
import { getProduction } from "@/modules/productions/services";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const production = await getProduction(id);

  if (!production) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{production.code}</CardTitle>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={production.status === "DRAFT" ? "outline" : "default"}>
              {PRODUCTION_STATUS_LABELS[production.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Data</p>
            <p>{formatDateTime(production.date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Produto final</p>
            <p>
              {production.finishedProduct.sku} — {production.finishedProduct.name}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Quantidade a produzir</p>
            <p>
              {formatQuantity(production.quantity)}{" "}
              {UNIT_OF_MEASURE_LABELS[production.finishedProduct.unit]}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Armazém de origem (materiais)</p>
            <p>{production.sourceWarehouse.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">
              Armazém de destino (produto final)
            </p>
            <p>{production.destinationWarehouse.name}</p>
          </div>
          {production.notes && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Observações</p>
              <p>{production.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Materiais necessários</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Qtd. por unidade</TableHead>
                <TableHead>Qtd. necessária</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {production.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.materialProduct.sku} — {item.materialProduct.name}
                  </TableCell>
                  <TableCell>
                    {formatQuantity(item.quantityPerUnit)}{" "}
                    {UNIT_OF_MEASURE_LABELS[item.materialProduct.unit]}
                  </TableCell>
                  <TableCell>
                    {formatQuantity(item.quantityUsed)}{" "}
                    {UNIT_OF_MEASURE_LABELS[item.materialProduct.unit]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
