"use client"

import { Home, ImageIcon, Settings, BarChart3, FileText, ShieldCheck } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: Home,
  },
  {
    title: "Galerie",
    url: "/gallery",
    icon: ImageIcon,
  },
  {
    title: "Analyses",
    url: "/analytics",
    icon: BarChart3,
  },

  {
    title: "Rapports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-slate-950 text-white">
      <SidebarHeader className="border-b border-white/10 px-3 py-3">
        <div className="flex h-12 items-center gap-3 overflow-hidden rounded-xl px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20">
            <Image src="/logo.png" alt="Nextronic" width={40} height={40} className="h-9 w-9 object-contain" priority />
          </div>
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-wide">Nextronic</span>
            <span className="truncate text-xs text-slate-400">Contrôle industriel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} size="lg" className="h-11 rounded-xl px-3 text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-teal-500 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-teal-950/30 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!h-11 group-data-[collapsible=icon]:!w-11 group-data-[collapsible=icon]:!p-0 [&>svg]:h-5 [&>svg]:w-5 group-data-[collapsible=icon]:[&>svg]:mx-auto">
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-3 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:p-2.5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-slate-200">Système opérationnel</p>
            <p className="text-[11px] text-slate-500">Supervision active</p>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
