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
import { cn } from "@/lib/utils";
import { formatDateTime, formatQuantity } from "@/lib/format";
import {
  MANUAL_MOVEMENT_TYPES,
  MOVEMENT_TYPE_LABELS,
  stockMovementListQuerySchema,
} from "@/modules/stock/schemas";
import { listStockMovements } from "@/modules/stock/services";
import { listProducts } from "@/modules/products/services";
import { listWarehouses } from "@/modules/warehouses/services";
import { ReverseMovementButton } from "@/modules/stock/components/reverse-movement-button";

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
  const parsedQuery = stockMovementListQuerySchema.safeParse({
    productId: first(rawParams.productId) || undefined,
    warehouseId: first(rawParams.warehouseId) || undefined,
    type: first(rawParams.type) || undefined,
    dateFrom: first(rawParams.dateFrom) || undefined,
    dateTo: first(rawParams.dateTo) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : stockMovementListQuerySchema.parse({});

  const [movements, products, warehouses] = await Promise.all([
    listStockMovements(query),
    listProducts({ sort: "name", order: "asc" }),
    listWarehouses({ sort: "name", order: "asc" }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de movimentações de entrada, saída e ajuste.
          </p>
        </div>
        <Link
          href="/estoque/nova"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova movimentação
        </Link>
      </div>

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
              <label htmlFor="productId" className="text-sm font-medium">
                Produto
              </label>
              <select
                id="productId"
                name="productId"
                defaultValue={query.productId ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} — {product.name}
                  </option>
                ))}
              </select>
            </div>
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
              <label htmlFor="type" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                defaultValue={query.type ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todos</option>
                {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="dateFrom" className="text-sm font-medium">
                De
              </label>
              <input
                id="dateFrom"
                name="dateFrom"
                type="date"
                defaultValue={query.dateFrom ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="dateTo" className="text-sm font-medium">
                Até
              </label>
              <input
                id="dateTo"
                name="dateTo"
                type="date"
                defaultValue={query.dateTo ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex items-end gap-2 lg:col-span-5">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/estoque"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Limpar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Armazém</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma movimentação encontrada.
                  </TableCell>
                </TableRow>
              )}
              {movements.map((movement) => {
                const warehouse = movement.toWarehouse ?? movement.fromWarehouse;
                const canReverse =
                  MANUAL_MOVEMENT_TYPES.includes(
                    movement.type as (typeof MANUAL_MOVEMENT_TYPES)[number],
                  ) && !movement.reversedBy;
                return (
                  <TableRow key={movement.id}>
                    <TableCell>{formatDateTime(movement.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {MOVEMENT_TYPE_LABELS[movement.type]}
                      </Badge>
                      {movement.reversalOfId && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (estorno)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {movement.product.sku} — {movement.product.name}
                    </TableCell>
                    <TableCell>{warehouse?.name ?? "—"}</TableCell>
                    <TableCell>{formatQuantity(movement.quantity)}</TableCell>
                    <TableCell className="max-w-64 truncate">
                      {movement.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      {canReverse ? (
                        <ReverseMovementButton movementId={movement.id} />
                      ) : (
                        movement.reversedBy && (
                          <span className="text-xs text-muted-foreground">
                            Estornada
                          </span>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
