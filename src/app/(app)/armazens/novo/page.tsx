import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WarehouseForm } from "@/modules/warehouses/components/warehouse-form";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo armazém</CardTitle>
      </CardHeader>
      <CardContent>
        <WarehouseForm />
      </CardContent>
    </Card>
  );
}
