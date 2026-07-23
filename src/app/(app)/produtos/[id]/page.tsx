import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductForm } from "@/modules/products/components/product-form";
import { getProduct } from "@/modules/products/services";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar produto</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm
          productId={product.id}
          defaultValues={{
            sku: product.sku,
            name: product.name,
            type: product.type,
            unit: product.unit,
            description: product.description ?? "",
            barcode: product.barcode ?? "",
            unitCost: product.unitCost ? product.unitCost.toString() : "",
            defaultPrice: product.defaultPrice
              ? product.defaultPrice.toString()
              : "",
            minStock: product.minStock ? product.minStock.toString() : "",
            imageUrl: product.imageUrl ?? "",
            notes: product.notes ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
