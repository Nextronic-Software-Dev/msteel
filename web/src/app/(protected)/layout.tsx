import React from "react";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/session-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfessionalHeader } from "@/components/professional-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) redirect("/authentication");

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-slate-50/80 dark:bg-slate-950">
          <ProfessionalHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
