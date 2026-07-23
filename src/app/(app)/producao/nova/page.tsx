import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/server/db";
import { ProductionForm } from "@/modules/productions/components/production-form";

export default async function Page() {
  const [compositions, warehouses] = await Promise.all([
    db.composition.findMany({
      where: { active: true, finishedProduct: { active: true } },
      include: {
        finishedProduct: true,
        items: { include: { materialProduct: true } },
      },
      orderBy: { finishedProduct: { name: "asc" } },
    }),
    db.warehouse.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const finishedProducts = compositions.map((composition) => ({
    id: composition.finishedProductId,
    label: `${composition.finishedProduct.sku} — ${composition.finishedProduct.name}`,
  }));

  const materialsByFinishedProduct = Object.fromEntries(
    compositions.map((composition) => [
      composition.finishedProductId,
      composition.items.map((item) => ({
        materialProductId: item.materialProductId,
        label: `${item.materialProduct.sku} — ${item.materialProduct.name}`,
        quantityPerUnit: item.quantity.toString(),
        unit: item.materialProduct.unit,
      })),
    ]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova produção</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductionForm
          finishedProducts={finishedProducts}
          materialsByFinishedProduct={materialsByFinishedProduct}
          warehouses={warehouses.map((warehouse) => ({
            id: warehouse.id,
            label: `${warehouse.code} — ${warehouse.name}`,
          }))}
        />
      </CardContent>
    </Card>
  );
}
