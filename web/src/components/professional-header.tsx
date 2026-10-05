"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, ChevronDown, Clock3, LogOut, Settings, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "./session-provider"
import { logout } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Tableau de bord", subtitle: "Suivi des mesures en temps réel" },
  "/gallery": { title: "Galerie", subtitle: "Images des tôles traitées" },
  "/analytics": { title: "Analyses", subtitle: "Indicateurs de production" },
  "/reports": { title: "Rapports", subtitle: "Traçabilité et exports" },
  "/settings": { title: "Paramètres", subtitle: "Compte et préférences" },
}

export function ProfessionalHeader() {
  const session = useSession()
  const pathname = usePathname()
  const [now, setNow] = useState<Date | null>(null)
  const currentPage = pageTitles[pathname] || pageTitles["/"]
  const user = session?.session.user

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center border-b border-border bg-background/90 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl dark:shadow-black/20 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="shrink-0 border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground" />
        <div className="h-8 w-px bg-border" />
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">{currentPage.title}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{currentPage.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1.5 text-xs font-semibold tabular-nums text-foreground lg:hidden">
          <Clock3 className="h-3.5 w-3.5 text-teal-600" />
          {now?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) || "--:--"}
        </div>
        <div className="hidden items-center gap-4 rounded-xl border border-border bg-muted/60 px-3 py-2 lg:flex">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-teal-600" />
            <span>{now?.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) || "—"}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex min-w-[84px] items-center gap-2 text-sm font-semibold tabular-nums text-foreground">
            <Clock3 className="h-4 w-4 text-teal-600" />
            <span>{now?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) || "--:--:--"}</span>
          </div>
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-2 rounded-xl px-2 hover:bg-accent sm:px-3">
              <Avatar className="h-8 w-8 ring-2 ring-teal-100">
                <AvatarFallback className="bg-teal-700 text-xs font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="hidden max-w-32 text-left sm:block">
                <p className="truncate text-sm font-medium leading-tight">{user?.name || "Utilisateur"}</p>
                <p className="truncate text-[11px] text-muted-foreground">Administrateur</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-xl p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name || "Utilisateur"}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email || ""}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-lg"><Link href="/settings"><User className="mr-2 h-4 w-4" /> Profil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg"><Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Paramètres</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="rounded-lg text-red-600 focus:text-red-700">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
