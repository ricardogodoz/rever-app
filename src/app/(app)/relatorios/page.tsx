import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { stockReportQuerySchema } from "@/modules/reports/schemas";
import { getCurrentStockReport } from "@/modules/reports/services";
import { listWarehouses } from "@/modules/warehouses/services";
import { UNIT_OF_MEASURE_LABELS } from "@/modules/products/schemas";
import { ReportsNav } from "@/modules/reports/components/reports-nav";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = stockReportQuerySchema.safeParse({
    warehouseId: first(rawParams.warehouseId) || undefined,
    status: first(rawParams.status) || undefined,
    belowMinOnly: first(rawParams.belowMinOnly),
    sort: first(rawParams.sort) || undefined,
    order: first(rawParams.order) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : stockReportQuerySchema.parse({});

  const [{ rows, totals }, warehouses] = await Promise.all([
    getCurrentStockReport(query),
    listWarehouses({ sort: "name", order: "asc" }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Estoque atual, com valor estimado por produto.
        </p>
      </div>

      <ReportsNav />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-1">
              <label htmlFor="warehouseId" className="text-sm font-medium">
                Armazém
              </label>
              <select
                id="warehouseId"
                name="warehouseId"
                defaultValue={query.warehouseId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} — {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">
                Produtos
              </label>
              <select
                id="status"
                name="status"
                defaultValue={query.status}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sort" className="text-sm font-medium">
                Ordenar por
              </label>
              <div className="flex gap-1">
                <select
                  id="sort"
                  name="sort"
                  defaultValue={query.sort}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="name">Nome</option>
                  <option value="quantity">Quantidade</option>
                </select>
                <select
                  name="order"
                  defaultValue={query.order}
                  aria-label="Direção da ordenação"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end">
              <Checkbox
                id="belowMinOnly"
                name="belowMinOnly"
                value="true"
                defaultChecked={query.belowMinOnly}
              />
              <label htmlFor="belowMinOnly" className="text-sm font-medium">
                Só abaixo do mínimo
              </label>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/relatorios"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Limpar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Estoque atual</CardTitle>
          <div className="text-sm text-muted-foreground">
            {totals.itemCount} produto(s) · Valor estimado total:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totals.totalEstimatedValue)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Valor estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.productId}>
                  <TableCell className="font-medium">{row.sku}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{UNIT_OF_MEASURE_LABELS[row.unit]}</TableCell>
                  <TableCell>
                    {formatQuantity(row.quantity)}
                    {row.belowMin && (
                      <Badge variant="destructive" className="ml-2">
                        Abaixo do mínimo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatQuantity(row.minStock)}</TableCell>
                  <TableCell>{formatCurrency(row.estimatedValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
