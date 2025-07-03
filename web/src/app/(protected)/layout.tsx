import React from "react";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/session-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

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
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
