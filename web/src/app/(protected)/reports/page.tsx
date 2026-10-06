import Link from "next/link"
import { Prisma } from "@prisma/client"
import { FileSearch, Search } from "lucide-react"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportDialog } from "@/components/export-dialog"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 50
type SearchParams = { page?: string; q?: string; status?: string; start?: string; end?: string }

export default async function ReportsPage({ searchParams = {} }: { searchParams?: SearchParams }) {
  const page = Math.max(1, Number.parseInt(searchParams.page || "1", 10) || 1)
  const q = (searchParams.q || "").trim()
  const status = searchParams.status || "all"
  const filters: Prisma.ProcessedImageWhereInput[] = []

  if (q) {
    const id = Number.parseInt(q, 10)
    filters.push({ OR: [
      { customId: { contains: q, mode: "insensitive" } },
      { imagePath: { contains: q, mode: "insensitive" } },
      ...(Number.isFinite(id) ? [{ id }] : []),
    ] })
  }
  if (status === "sent") filters.push({ sent: true })
  if (status === "ready") filters.push({ sent: false, customId: { not: null } })
  if (status === "unidentified") filters.push({ customId: null })
  if (searchParams.start) filters.push({ createdAt: { gte: new Date(`${searchParams.start}T00:00:00`) } })
  if (searchParams.end) filters.push({ createdAt: { lte: new Date(`${searchParams.end}T23:59:59.999`) } })

  const where: Prisma.ProcessedImageWhereInput = filters.length ? { AND: filters } : {}
  const [images, total, sent, ready, unidentified] = await Promise.all([
    db.processedImage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.processedImage.count({ where }),
    db.processedImage.count({ where: { AND: [where, { sent: true }] } }),
    db.processedImage.count({ where: { AND: [where, { sent: false, customId: { not: null } }] } }),
    db.processedImage.count({ where: { AND: [where, { customId: null }] } }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const serialized = images.map((image) => ({ ...image, createdAt: image.createdAt.toISOString(), updatedAt: image.updatedAt.toISOString(), sentAt: image.sentAt?.toISOString() ?? null }))
  const pageUrl = (target: number) => {
    const params = new URLSearchParams({ page: String(target) })
    if (q) params.set("q", q)
    if (status !== "all") params.set("status", status)
    if (searchParams.start) params.set("start", searchParams.start)
    if (searchParams.end) params.set("end", searchParams.end)
    return `/reports?${params}`
  }

  return <div className="w-full space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-400">Traçabilité</p><h1 className="text-3xl font-bold tracking-tight">Rapports de production</h1><p className="mt-1 text-muted-foreground">Recherche et pagination exécutées directement dans PostgreSQL.</p></div><div className="flex items-center gap-2"><ExportDialog images={serialized} /><Badge variant="outline">50 lignes/page</Badge></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Résultats", total, "text-foreground"], ["Envoyées", sent, "text-emerald-700 dark:text-emerald-400"], ["Prêtes", ready, "text-blue-700 dark:text-blue-400"], ["À identifier", unidentified, "text-amber-700 dark:text-amber-400"]].map(([label, value, color]) => <Card key={String(label)}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></CardContent></Card>)}</div>
    <Card><CardContent className="p-5"><form method="get" className="grid gap-4 lg:grid-cols-6"><div className="relative lg:col-span-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="ID, fichier ou numéro…" className="pl-9" /></div><select name="status" defaultValue={status} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="all">Tous les statuts</option><option value="sent">Envoyées</option><option value="ready">Prêtes à envoyer</option><option value="unidentified">À identifier</option></select><Input name="start" aria-label="Date de début" type="date" defaultValue={searchParams.start} /><Input name="end" aria-label="Date de fin" type="date" defaultValue={searchParams.end} /><div className="flex gap-2"><Button type="submit" className="flex-1">Filtrer</Button><Button variant="outline" asChild><Link href="/reports">Effacer</Link></Button></div></form></CardContent></Card>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Date</TableHead><TableHead>Pièce</TableHead><TableHead>Statut</TableHead>{["L1", "L2", "L3", "L4", "L5", "W1", "W2", "W3"].map((name) => <TableHead key={name} className="text-right">{name}</TableHead>)}</TableRow></TableHeader><TableBody>{images.map((image) => <TableRow key={image.id}><TableCell className="whitespace-nowrap text-sm">{image.createdAt.toLocaleDateString("fr-FR")}</TableCell><TableCell><p className="font-medium">{image.customId || `Pièce #${image.id}`}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{image.imagePath.split("/").pop()}</p></TableCell><TableCell><Badge variant={image.sent ? "default" : image.customId ? "secondary" : "outline"}>{image.sent ? "Envoyée" : image.customId ? "Prête" : "À identifier"}</Badge></TableCell>{[image.l1, image.l2, image.l3, image.l4, image.l5, image.w1, image.w2, image.w3].map((value, index) => <TableCell key={index} className="text-right tabular-nums">{value.toFixed(1)}</TableCell>)}</TableRow>)}{!images.length && <TableRow><TableCell colSpan={11} className="h-64 text-center"><FileSearch className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><p className="font-medium">Aucun résultat</p></TableCell></TableRow>}</TableBody></Table></div></Card>
    <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Page {page} sur {totalPages} · {total} résultat(s)</p><div className="flex gap-2"><Button variant="outline" asChild={page > 1} disabled={page <= 1}>{page > 1 ? <Link href={pageUrl(page - 1)}>Précédente</Link> : <span>Précédente</span>}</Button><Button variant="outline" asChild={page < totalPages} disabled={page >= totalPages}>{page < totalPages ? <Link href={pageUrl(page + 1)}>Suivante</Link> : <span>Suivante</span>}</Button></div></div>
  </div>
}
