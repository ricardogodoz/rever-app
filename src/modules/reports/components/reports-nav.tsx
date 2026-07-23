"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/relatorios", label: "Estoque atual" },
  { href: "/relatorios/financeiro", label: "Saldo financeiro" },
  { href: "/relatorios/extrato", label: "Extrato por conta" },
] as const;

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 border-b">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
