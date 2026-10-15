"use client"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { previewIdImport, applyIdImport } from "@/lib/id-import-actions"
import type { ImportPreview, ImportRequest, ImportStatus } from "@/lib/id-import"
import type { ColumnMapping, MachineSheet } from "@/lib/machine-file"

const statusLabels: Record<ImportStatus, string> = {
  ready: "À importer", unmatched: "Aucun événement dans la tolérance", ambiguous: "Correspondance ambiguë",
  existing: "ID déjà renseigné", conflict: "Autre ID déjà renseigné", duplicate: "N°Lot en double ou déjà utilisé", sent: "Événement déjà envoyé",
}
const initialMapping: ColumnMapping = { id: -1, date: -1, time: -1, dateOrder: "dmy", zone: "local" }
const selectClass = "h-10 w-full rounded-md border bg-background px-3 text-sm"

export function ImportIdsDialog({ onImported, onOpenChange }: { onImported: () => Promise<void>; onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sheets, setSheets] = useState<MachineSheet[]>([])
  const [sheetIndex, setSheetIndex] = useState(0)
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping)
  const [tolerance, setTolerance] = useState("10")
  const [advanced, setAdvanced] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [request, setRequest] = useState<ImportRequest | null>(null)
  const sheet = sheets[sheetIndex]
  const readyCount = preview?.matches.filter(match => match.status === "ready").length || 0

  const invalidate = () => { setPreview(null); setRequest(null); setErrors([]) }
  const changeOpen = (value: boolean) => {
    if (busy) return
    setOpen(value)
    onOpenChange(value)
    if (!value) invalidate()
  }
  const changeMapping = (patch: Partial<ColumnMapping>) => { setMapping(current => ({ ...current, ...patch })); invalidate() }

  const readFile = async (file?: File) => {
    invalidate()
    setSheets([])
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors(["Le fichier doit faire moins de 5 Mo."]); return }
    if (!/\.(csv|tsv|txt|xlsx|xls)$/i.test(file.name)) { setErrors(["Choisissez un fichier CSV, TSV ou Excel (.xlsx, .xls)."]); return }
    setBusy(true)
    let detected: { sheet: MachineSheet; mapping: ColumnMapping } | null = null
    try {
      const { readMachineFile } = await import("@/lib/machine-file")
      const parsed = readMachineFile(await file.arrayBuffer()).filter(item => item.headers.length)
      if (!parsed.length) throw new Error("Le fichier est vide.")
      setSheets(parsed)
      setSheetIndex(0)
      detected = { sheet: parsed[0], mapping: await detect(parsed[0]) }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Impossible de lire le fichier."])
    } finally { setBusy(false) }
    if (detected) await prepare(detected.sheet, detected.mapping)
  }

  const detect = async (target: MachineSheet) => {
    const { detectColumns } = await import("@/lib/machine-file")
    const next = { ...mapping, ...detectColumns(target) }
    setMapping(next)
    setAdvanced(next.id < 0 || next.date < 0)
    return next
  }

  const prepare = async (target = sheet, columns = mapping) => {
    if (!target) return
    invalidate()
    if (columns.id < 0 || columns.date < 0) {
      setErrors(["Colonnes N°Lot ou date introuvables. Choisissez-les dans les options avancées."])
      return
    }
    const seconds = Number(tolerance)
    if (!tolerance.trim() || !Number.isInteger(seconds) || seconds < 0 || seconds > 900) {
      setErrors(["La tolérance doit être un nombre entier entre 0 et 900 secondes (15 minutes)."])
      return
    }
    setBusy(true)
    try {
      const { recordsFromSheet } = await import("@/lib/machine-file")
      const parsed = recordsFromSheet(target, columns)
      if (parsed.errors.length) { setErrors(parsed.errors); return }
      const input = { records: parsed.records, toleranceSeconds: seconds }
      const result = await previewIdImport(input)
      if (!result.success) throw new Error(result.error)
      setPreview(result.preview)
      setRequest(input)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Impossible de préparer l’aperçu."])
    } finally { setBusy(false) }
  }

  const apply = async () => {
    if (!request || !preview || !readyCount) return
    setBusy(true)
    setErrors([])
    try {
      const result = await applyIdImport(request, preview.fingerprint)
      if (!result.success) throw new Error(result.error)
      toast.success(`${result.count} ID(s) importé(s)`)
      setPreview(null)
      setRequest(null)
      setOpen(false)
      onOpenChange(false)
      await onImported()
    } catch (error) {
      setPreview(null)
      setRequest(null)
      setErrors([error instanceof Error ? error.message : "Impossible d’enregistrer l’import."])
    } finally { setBusy(false) }
  }

  const columns = (label: string, key: "id" | "date" | "time") => (
    <div className="space-y-1">
      <Label htmlFor={`import-${key}`}>{label}</Label>
      <select id={`import-${key}`} className={selectClass} value={mapping[key]} onChange={event => changeMapping({ [key]: Number(event.target.value) })}>
        <option value={-1}>{key === "time" ? "Incluse dans la colonne date" : "Choisir une colonne"}</option>
        {sheet?.headers.map((header, index) => <option key={index} value={index}>{header}</option>)}
      </select>
    </div>
  )
  const showTime = (time: string) => new Date(time).toLocaleString("fr-FR", { timeZone: mapping.zone === "utc" ? "UTC" : undefined })

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" />Importer les IDs</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importer les N°Lot depuis la machine</DialogTitle>
          <DialogDescription>
            Associer les lots aux événements par date et heure, dans l’ordre chronologique.
            La recherche couvre toutes les pages sur la période du fichier, indépendamment des filtres du tableau.
            Seuls les IDs vides et non ambigus seront remplis.
          </DialogDescription>
        </DialogHeader>
        <fieldset disabled={busy} className="min-w-0 space-y-4 disabled:opacity-60">
          <div className="space-y-1">
            <Label htmlFor="machine-file">Fichier machine</Label>
            <Input id="machine-file" type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" onChange={event => void readFile(event.target.files?.[0])} />
            <p className="text-xs text-muted-foreground">CSV ou Excel, première ligne = noms des colonnes. Maximum 2 000 lignes et 5 Mo.</p>
          </div>
          {sheet && <>
            {sheets.length > 1 && <div className="space-y-1">
              <Label htmlFor="import-sheet">Feuille</Label>
              <select id="import-sheet" className={selectClass} value={sheetIndex} onChange={async event => {
                const index = Number(event.target.value)
                setSheetIndex(index)
                await prepare(sheets[index], await detect(sheets[index]))
              }}>{sheets.map((item, index) => <option key={index} value={index}>{item.name}</option>)}</select>
            </div>}
            <p className="text-sm text-muted-foreground">
              Colonnes détectées : N°Lot = <strong>{sheet.headers[mapping.id] ?? "?"}</strong>,
              date = <strong>{sheet.headers[mapping.date] ?? "?"}</strong>
              {mapping.time >= 0 && <>, heure = <strong>{sheet.headers[mapping.time]}</strong></>}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="import-date-order">Format des dates</Label>
                <select id="import-date-order" className={selectClass} value={mapping.dateOrder} onChange={event => {
                  const next = { ...mapping, dateOrder: event.target.value as "dmy" | "mdy" }
                  setMapping(next)
                  void prepare(sheet, next)
                }}>
                  <option value="dmy">Jour / Mois / Année</option><option value="mdy">Mois / Jour / Année</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="import-tolerance">Écart maximum (secondes, 900 = 15 min max)</Label>
                <Input id="import-tolerance" type="number" min={0} max={900} step={1} value={tolerance} onChange={event => { setTolerance(event.target.value); invalidate() }} onBlur={() => { if (!preview) void prepare() }} />
              </div>
            </div>
            <details open={advanced} onToggle={event => setAdvanced(event.currentTarget.open)} className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-medium">Options avancées</summary>
            <div className="mt-3 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {columns("Colonne ID (N°Lot)", "id")}
              {columns("Colonne date / horodatage", "date")}
              {columns("Colonne heure (si séparée)", "time")}
              <div className="space-y-1">
                <Label htmlFor="import-zone">Fuseau des heures du fichier</Label>
                <select id="import-zone" className={selectClass} value={mapping.zone} onChange={event => changeMapping({ zone: event.target.value as "local" | "utc" })}>
                  <option value="local">Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option><option value="utc">UTC</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Les dates ISO avec un fuseau explicite conservent ce fuseau. Un écart peut être positif ou négatif.</p>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Ligne</TableHead><TableHead>N°Lot</TableHead><TableHead>Date / heure du fichier (extrait)</TableHead></TableRow></TableHeader>
                <TableBody>{sheet.rows.slice(0, 3).map(row => <TableRow key={row.row}>
                  <TableCell>{row.row}</TableCell><TableCell>{row.cells[mapping.id] || "—"}</TableCell>
                  <TableCell>{row.cells[mapping.date] || "—"} {mapping.time >= 0 ? row.cells[mapping.time] : ""}</TableCell>
                </TableRow>)}</TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" onClick={() => void prepare()} disabled={mapping.id < 0 || mapping.date < 0}>Recalculer les correspondances ({sheet.rows.length} lignes)</Button>
            </div>
            </details>
          </>}
        </fieldset>
        {busy && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Traitement en cours…</p>}
        {errors.length > 0 && <div role="alert" className="max-h-40 overflow-auto rounded-md border border-destructive p-3 text-sm text-destructive">
          {errors.slice(0, 20).map((error, index) => <p key={index}>{error}</p>)}
          {errors.length > 20 && <p>… et {errors.length - 20} autre(s) erreur(s).</p>}
        </div>}
        {preview && <div className="space-y-3">
          <p className="text-sm font-medium">{readyCount} ID(s) à importer · {preview.matches.length - readyCount} ligne(s) ignorée(s)</p>
          <p className="text-xs text-muted-foreground">Les IDs existants sont conservés. Les doublons, conflits et correspondances ambiguës sont ignorés.</p>
          <div className="max-h-72 overflow-auto rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Ligne / N°Lot</TableHead><TableHead>Heure machine</TableHead><TableHead>Événement plateforme</TableHead><TableHead>Écart</TableHead><TableHead>Résultat</TableHead></TableRow></TableHeader>
              <TableBody>{preview.matches.map(match => <TableRow key={match.row}>
                <TableCell><span className="text-muted-foreground">{match.row} · </span>{match.customId}</TableCell>
                <TableCell className="whitespace-nowrap">{showTime(match.timestamp)}</TableCell>
                <TableCell>{match.eventId ? <><span>#{match.eventId}</span><br /><span className="whitespace-nowrap text-xs">{showTime(match.eventTime!)}</span></> : "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{match.differenceSeconds !== undefined ? `${match.differenceSeconds > 0 ? "+" : ""}${match.differenceSeconds} s` : "—"}</TableCell>
                <TableCell className={match.status === "ready" ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>{statusLabels[match.status]}{match.status === "conflict" && ` (${match.existingId})`}</TableCell>
              </TableRow>)}</TableBody>
            </Table>
          </div>
        </div>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Fermer</Button>
          <Button disabled={busy || !readyCount} onClick={apply}>Importer {readyCount} ID(s)</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
