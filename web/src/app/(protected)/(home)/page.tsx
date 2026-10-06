import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getImagesPage } from "@/lib/action"
import { ImageTable } from "@/components/ImageTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FilterX, Search } from "lucide-react"
import Link from "next/link"

type HomeSearchParams = { q?: string; status?: "all" | "identified" | "unidentified" | "sent" | "ready" }

export default async function Home({ searchParams = {} }: { searchParams?: HomeSearchParams }) {
  const session = await getServerSession()
  if (!session) redirect("/authentication")
  
  const filters = { query: searchParams.q || "", status: searchParams.status || "all" as const }
  const imageData = await getImagesPage(1, 10, filters)
  
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Traitement des Tôles</h1>
          <p className="text-muted-foreground">Gérer les images et leurs dimensions</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <form method="get" className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input name="q" defaultValue={filters.query} placeholder="Rechercher par ID, numéro ou fichier…" className="pl-9" />
            </div>
            <select name="status" defaultValue={filters.status} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="all">Tous les enregistrements</option>
              <option value="identified">ID défini</option>
              <option value="unidentified">ID non défini</option>
              <option value="ready">Prêt à envoyer</option>
              <option value="sent">Déjà envoyé</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Appliquer</Button>
              <Button type="button" variant="outline" size="icon" asChild title="Effacer les filtres"><Link href="/"><FilterX className="h-4 w-4" /></Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <ImageTable initialData={imageData} filters={filters} />
    </div>
  )
}
