import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeto iniciado</CardTitle>
        <CardDescription>
          A fundação do App Interno Rever está pronta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Login, proteção de rotas e navegação estão funcionando. Os
          indicadores do dashboard serão implementados na Fase 4 — ver{" "}
          <code>docs/roadmap.md</code>.
        </p>
      </CardContent>
    </Card>
  );
}
