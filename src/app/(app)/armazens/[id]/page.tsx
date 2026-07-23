import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WarehouseForm } from "@/modules/warehouses/components/warehouse-form";
import { getWarehouse } from "@/modules/warehouses/services";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const warehouse = await getWarehouse(id);

  if (!warehouse) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar armazém</CardTitle>
      </CardHeader>
      <CardContent>
        <WarehouseForm
          warehouseId={warehouse.id}
          lockDefault={warehouse.isDefault}
          defaultValues={{
            code: warehouse.code,
            name: warehouse.name,
            location: warehouse.location ?? "",
            isDefault: warehouse.isDefault,
          }}
        />
      </CardContent>
    </Card>
  );
}
