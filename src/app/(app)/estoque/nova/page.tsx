import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listProducts } from "@/modules/products/services";
import { listWarehouses } from "@/modules/warehouses/services";
import { MovementForm } from "@/modules/stock/components/movement-form";

export default async function Page() {
  const [products, warehouses] = await Promise.all([
    listProducts({ status: "active", sort: "name", order: "asc" }),
    listWarehouses({ status: "active", sort: "name", order: "asc" }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova movimentação de estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <MovementForm
          products={products.map((product) => ({
            id: product.id,
            label: `${product.sku} — ${product.name}`,
          }))}
          warehouses={warehouses.map((warehouse) => ({
            id: warehouse.id,
            label: `${warehouse.code} — ${warehouse.name}`,
          }))}
        />
      </CardContent>
    </Card>
  );
}
