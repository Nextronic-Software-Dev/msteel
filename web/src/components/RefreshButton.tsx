"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function RefreshButton() {
  const router = useRouter()
  return (
    <Button variant="outline" size="sm" onClick={() => router.refresh()}>
      <RefreshCw className="h-4 w-4 mr-2" />
      Actualiser
    </Button>
  )
}