import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Módulo em construção.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Este módulo ainda não foi implementado. Acompanhe o progresso em{" "}
          <code>docs/roadmap.md</code>.
        </p>
      </CardContent>
    </Card>
  );
}
