import type { ReactNode } from "react";
import { auth } from "@/server/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const userLabel = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-heading text-sm font-semibold">
            App Interno Rever
          </span>
        </div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header userLabel={userLabel} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
