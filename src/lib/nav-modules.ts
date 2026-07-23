import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Layers,
  Factory,
  Landmark,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileBarChart,
  Settings,
} from "lucide-react";

export type NavModule = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_MODULES: NavModule[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/armazens", label: "Armazéns", icon: Warehouse },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/composicao", label: "Composição de produtos", icon: Layers },
  { href: "/producao", label: "Produção", icon: Factory },
  { href: "/bancos", label: "Bancos e contas", icon: Landmark },
  { href: "/receitas", label: "Receitas", icon: TrendingUp },
  { href: "/despesas", label: "Despesas", icon: TrendingDown },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
