"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <TooltipProvider delayDuration={200}><Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border-border bg-background shadow-sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 text-amber-500 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-sky-400 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{isDark ? "Mode clair" : "Mode sombre"}</TooltipContent>
    </Tooltip></TooltipProvider>
  )
}
