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
  PRODUCTION_STATUSES,
  PRODUCTION_STATUS_LABELS,
  productionListQuerySchema,
} from "@/modules/productions/schemas";
import { listProductions } from "@/modules/productions/services";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const STATUS_BADGE_VARIANT: Record<string, "default" | "outline" | "destructive"> = {
  DRAFT: "outline",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = productionListQuerySchema.safeParse({
    q: first(rawParams.q),
    status: first(rawParams.status) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : productionListQuerySchema.parse({});

  const productions = await listProductions(query);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Produção</h1>
          <p className="text-sm text-muted-foreground">
            Ordens de produção e materiais consumidos.
          </p>
        </div>
        <Link
          href="/producao/nova"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova produção
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 lg:col-span-2">
              <label htmlFor="q" className="text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Código, nome ou SKU do produto final"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="status"
                name="status"
                defaultValue={query.status ?? ""}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Todas</option>
                {PRODUCTION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PRODUCTION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/producao"
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
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Produto final</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Origem → Destino</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma produção encontrada.
                  </TableCell>
                </TableRow>
              )}
              {productions.map((production) => (
                <TableRow key={production.id}>
                  <TableCell className="font-medium">
                    {production.code}
                  </TableCell>
                  <TableCell>{formatDateTime(production.date)}</TableCell>
                  <TableCell>
                    {production.finishedProduct.sku} —{" "}
                    {production.finishedProduct.name}
                  </TableCell>
                  <TableCell>{formatQuantity(production.quantity)}</TableCell>
                  <TableCell>
                    {production.sourceWarehouse.name} →{" "}
                    {production.destinationWarehouse.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[production.status]}>
                      {PRODUCTION_STATUS_LABELS[production.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/producao/${production.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Detalhes
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
