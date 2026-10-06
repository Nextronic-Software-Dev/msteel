import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 24

export default async function GalleryPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Math.max(1, Number.parseInt(searchParams?.page || "1", 10) || 1)
  const [images, total] = await Promise.all([
    db.processedImage.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.processedImage.count(),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return <div className="w-full space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-400">Contrôle visuel</p><h1 className="text-3xl font-bold tracking-tight">Galerie des images traitées</h1><p className="mt-1 text-muted-foreground">24 images chargées par page pour préserver les performances.</p></div><Badge variant="outline">{total} images</Badge></div>
    {!images.length ? <Card><CardContent className="flex min-h-64 items-center justify-center text-muted-foreground">Aucune image traitée pour le moment.</CardContent></Card> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{images.map((image) => <Card key={image.id} className="overflow-hidden transition-shadow hover:shadow-md"><div className="relative aspect-[4/3] w-full bg-muted"><Image src={image.imagePath} alt={image.customId || `Pièce ${image.id}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover" loading="lazy" quality={70} /></div><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between gap-2"><p className="truncate font-semibold">{image.customId || `Pièce #${image.id}`}</p><Badge variant={image.sent ? "default" : image.customId ? "secondary" : "outline"}>{image.sent ? "Envoyée" : image.customId ? "Prête" : "Nouvelle"}</Badge></div><p className="truncate text-xs text-muted-foreground">{image.imagePath.split("/").pop()}</p><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>L : {image.l1.toFixed(1)} · {image.l2.toFixed(1)} · {image.l3.toFixed(1)}</span><span>W : {image.w1.toFixed(1)} · {image.w2.toFixed(1)} · {image.w3.toFixed(1)}</span></div><p className="text-xs text-muted-foreground">{image.createdAt.toLocaleString("fr-FR")}</p></CardContent></Card>)}</div>}
    <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {page} sur {totalPages}</p><div className="flex gap-2"><Button variant="outline" asChild={page > 1} disabled={page <= 1}>{page > 1 ? <Link href={`/gallery?page=${page - 1}`}>Précédente</Link> : <span>Précédente</span>}</Button><Button variant="outline" asChild={page < totalPages} disabled={page >= totalPages}>{page < totalPages ? <Link href={`/gallery?page=${page + 1}`}>Suivante</Link> : <span>Suivante</span>}</Button></div></div>
  </div>
}
