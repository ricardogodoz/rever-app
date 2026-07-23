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
import { formatCurrency } from "@/lib/format";
import {
  PRODUCT_TYPE_LABELS,
  UNIT_OF_MEASURE_LABELS,
  productListQuerySchema,
} from "@/modules/products/schemas";
import { listProducts } from "@/modules/products/services";
import { ProductActiveToggle } from "@/modules/products/components/product-active-toggle";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "sku", label: "SKU" },
  { value: "type", label: "Tipo" },
] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const parsedQuery = productListQuerySchema.safeParse({
    q: first(rawParams.q),
    type: first(rawParams.type) || undefined,
    status: first(rawParams.status) || undefined,
    sort: first(rawParams.sort) || undefined,
    order: first(rawParams.order) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : productListQuerySchema.parse({});

  const products = await listProducts(query);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Materiais e produtos finais cadastrados.
          </p>
        </div>
        <Link
          href="/produtos/novo"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Novo produto
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
            <div className="space-y-1 lg:col-span-2">
              <label htmlFor="q" className="text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Nome ou SKU"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
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
                {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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
                href="/produtos"
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
                <TableHead>SKU</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Preço padrão</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{PRODUCT_TYPE_LABELS[product.type]}</TableCell>
                  <TableCell>{UNIT_OF_MEASURE_LABELS[product.unit]}</TableCell>
                  <TableCell>{formatCurrency(product.unitCost)}</TableCell>
                  <TableCell>{formatCurrency(product.defaultPrice)}</TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "default" : "outline"}>
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Link
                      href={`/produtos/${product.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Editar
                    </Link>
                    <ProductActiveToggle
                      productId={product.id}
                      active={product.active}
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
