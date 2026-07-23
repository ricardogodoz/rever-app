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
import { warehouseListQuerySchema } from "@/modules/warehouses/schemas";
import { listWarehouses } from "@/modules/warehouses/services";
import { listWarehouseIdsWithStock } from "@/modules/stock/services";
import { WarehouseActiveToggle } from "@/modules/warehouses/components/warehouse-active-toggle";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "code", label: "Código" },
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = warehouseListQuerySchema.safeParse({
    q: first(rawParams.q),
    status: first(rawParams.status) || undefined,
    sort: first(rawParams.sort) || undefined,
    order: first(rawParams.order) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : warehouseListQuerySchema.parse({});

  const [warehouses, warehouseIdsWithStock] = await Promise.all([
    listWarehouses(query),
    listWarehouseIdsWithStock(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Armazéns</h1>
          <p className="text-sm text-muted-foreground">
            Locais de estoque cadastrados.
          </p>
        </div>
        <Link
          href="/armazens/novo"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Novo armazém
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1 lg:col-span-2">
              <label htmlFor="q" className="text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Nome ou código"
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
                <option value="">Todos</option>
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
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/armazens"
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
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhum armazém encontrado.
                  </TableCell>
                </TableRow>
              )}
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">
                    {warehouse.code}
                  </TableCell>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location ?? "—"}</TableCell>
                  <TableCell>
                    {warehouse.isDefault && <Badge>Padrão</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={warehouse.active ? "default" : "outline"}>
                      {warehouse.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Link
                      href={`/armazens/${warehouse.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Editar
                    </Link>
                    <WarehouseActiveToggle
                      warehouseId={warehouse.id}
                      active={warehouse.active}
                      hasStock={warehouseIdsWithStock.has(warehouse.id)}
                    />
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
