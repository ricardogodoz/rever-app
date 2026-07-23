import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/server/db";
import { CompositionForm } from "@/modules/compositions/components/composition-form";

export default async function Page() {
  const [finishedProducts, materials] = await Promise.all([
    db.product.findMany({
      where: { type: "FINISHED", active: true },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { type: "MATERIAL", active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova composição</CardTitle>
      </CardHeader>
      <CardContent>
        <CompositionForm
          finishedProducts={finishedProducts.map((product) => ({
            id: product.id,
            label: `${product.sku} — ${product.name}`,
            unitCost: null,
          }))}
          materials={materials.map((product) => ({
            id: product.id,
            label: `${product.sku} — ${product.name}`,
            unitCost: product.unitCost ? product.unitCost.toString() : null,
          }))}
        />
      </CardContent>
    </Card>
  );
}
