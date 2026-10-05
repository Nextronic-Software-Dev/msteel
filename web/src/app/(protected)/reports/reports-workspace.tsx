"use client"

import { useMemo, useState } from "react"
import { Download, FileSearch, FilterX, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { exportToExcel } from "@/lib/export-excel"
import { toast, Toaster } from "sonner"

type ImageRecord = {
  id: number
  customId: string | null
  imagePath: string
  sent: boolean
  sentAt: string | null
  createdAt: string
  updatedAt: string
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
  w1: number
  w2: number
  w3: number
}

type Status = "all" | "sent" | "ready" | "unidentified"

export function ReportsWorkspace({ images }: { images: ImageRecord[] }) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<Status>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null

    return images.filter((image) => {
      const created = new Date(image.createdAt)
      const matchesSearch = !query ||
        image.customId?.toLowerCase().includes(query) ||
        image.imagePath.toLowerCase().includes(query) ||
        String(image.id).includes(query)
      const matchesStatus = status === "all" ||
        (status === "sent" && image.sent) ||
        (status === "ready" && !image.sent && !!image.customId) ||
        (status === "unidentified" && !image.customId)
      return matchesSearch && matchesStatus && (!start || created >= start) && (!end || created <= end)
    })
  }, [endDate, images, search, startDate, status])

  const clearFilters = () => {
    setSearch("")
    setStatus("all")
    setStartDate("")
    setEndDate("")
  }

  const download = () => {
    try {
      const filename = `rapport-toles-${new Date().toISOString().slice(0, 10)}.xlsx`
      exportToExcel(filtered, filename)
      toast.success("Rapport généré", { description: `${filtered.length} ligne(s) exportée(s)` })
    } catch {
      toast.error("Impossible de générer le rapport")
    }
  }

  const summary = {
    sent: filtered.filter((image) => image.sent).length,
    ready: filtered.filter((image) => !image.sent && image.customId).length,
    unidentified: filtered.filter((image) => !image.customId).length,
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Toaster />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Traçabilité</p>
          <h1 className="text-3xl font-bold tracking-tight">Rapports de production</h1>
          <p className="mt-1 text-muted-foreground">Recherchez, contrôlez et exportez les mesures enregistrées.</p>
        </div>
        <Button onClick={download} disabled={filtered.length === 0} className="gap-2">
          <Download className="h-4 w-4" /> Exporter {filtered.length} ligne{filtered.length > 1 ? "s" : ""}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Résultats", filtered.length, "text-slate-900"],
          ["Envoyées", summary.sent, "text-emerald-700"],
          ["Prêtes", summary.ready, "text-blue-700"],
          ["À identifier", summary.unidentified, "text-amber-700"],
        ].map(([label, value, color]) => (
          <Card key={label as string}><CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, nom de fichier ou numéro…" className="pl-9" />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value as Status)} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="all">Tous les statuts</option>
              <option value="sent">Envoyées</option>
              <option value="ready">Prêtes à envoyer</option>
              <option value="unidentified">À identifier</option>
            </select>
            <Input aria-label="Date de début" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <div className="flex gap-2">
              <Input aria-label="Date de fin" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              <Button variant="outline" size="icon" onClick={clearFilters} title="Effacer les filtres"><FilterX className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Date</TableHead>
                <TableHead>Pièce</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">L1</TableHead>
                <TableHead className="text-right">L2</TableHead>
                <TableHead className="text-right">L3</TableHead>
                <TableHead className="text-right">L4</TableHead>
                <TableHead className="text-right">L5</TableHead>
                <TableHead className="text-right">W1</TableHead>
                <TableHead className="text-right">W2</TableHead>
                <TableHead className="text-right">W3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((image) => {
                const statusLabel = image.sent ? "Envoyée" : image.customId ? "Prête" : "À identifier"
                return (
                  <TableRow key={image.id}>
                    <TableCell className="whitespace-nowrap text-sm">{new Date(image.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell><p className="font-medium">{image.customId || `Pièce #${image.id}`}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{image.imagePath.split("/").pop()}</p></TableCell>
                    <TableCell><Badge variant={image.sent ? "default" : image.customId ? "secondary" : "outline"}>{statusLabel}</Badge></TableCell>
                    {[image.l1, image.l2, image.l3, image.l4, image.l5, image.w1, image.w2, image.w3].map((value, index) => <TableCell key={index} className="text-right tabular-nums">{value.toFixed(1)}</TableCell>)}
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={11} className="h-64 text-center">
                  <FileSearch className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                  <p className="font-medium">Aucun résultat</p>
                  <p className="mt-1 text-sm text-muted-foreground">Modifiez les filtres pour afficher d’autres traitements.</p>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
