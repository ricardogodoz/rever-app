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
import { compositionListQuerySchema } from "@/modules/compositions/schemas";
import {
  calculateEstimatedCost,
  listCompositions,
} from "@/modules/compositions/services";
import { CompositionActiveToggle } from "@/modules/compositions/components/composition-active-toggle";

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
  const parsedQuery = compositionListQuerySchema.safeParse({
    q: first(rawParams.q),
    status: first(rawParams.status) || undefined,
  });
  const query = parsedQuery.success
    ? parsedQuery.data
    : compositionListQuerySchema.parse({});

  const compositions = await listCompositions(query);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Composição de produtos</h1>
          <p className="text-sm text-muted-foreground">
            Materiais e quantidades usados em cada produto final.
          </p>
        </div>
        <Link
          href="/composicao/nova"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova composição
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
                placeholder="Nome ou SKU do produto final"
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
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Filtrar</Button>
              <Link
                href="/composicao"
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
                <TableHead>Produto final</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Custo estimado</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compositions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma composição encontrada.
                  </TableCell>
                </TableRow>
              )}
              {compositions.map((composition) => (
                <TableRow key={composition.id}>
                  <TableCell className="font-medium">
                    {composition.finishedProduct.sku} —{" "}
                    {composition.finishedProduct.name}
                  </TableCell>
                  <TableCell>{composition.items.length}</TableCell>
                  <TableCell>
                    {formatCurrency(calculateEstimatedCost(composition.items))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={composition.active ? "default" : "outline"}>
                      {composition.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Link
                      href={`/composicao/${composition.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Detalhes
                    </Link>
                    <CompositionActiveToggle
                      compositionId={composition.id}
                      active={composition.active}
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
