"use client"

import { Activity, BadgeCheck, Clock3, Gauge, Ruler, Send } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  total: number
  identified: number
  sent: number
  todayCount: number
  weekCount: number
  dailyData: { label: string; processed: number; identified: number }[]
  dimensionData: { dimension: string; average: number }[]
  latest: { id: number; customId: string | null; sent: boolean; createdAt: string }[]
}

const colors = ["#0f766e", "#2563eb", "#d97706"]
const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 })
const tooltipStyle = { background: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 12 }

export function OptimizedAnalyticsDashboard({ total, identified, sent, todayCount, weekCount, dailyData, dimensionData, latest }: Props) {
  const identificationRate = total ? (identified / total) * 100 : 0
  const sentRate = total ? (sent / total) * 100 : 0
  const statusData = [
    { name: "Envoyées", value: sent },
    { name: "Prêtes", value: Math.max(0, identified - sent) },
    { name: "À identifier", value: Math.max(0, total - identified) },
  ].filter((item) => item.value > 0)
  const cards = [
    { label: "Total traité", value: total, detail: `${todayCount} aujourd’hui`, icon: Activity },
    { label: "Cette semaine", value: weekCount, detail: "7 derniers jours", icon: Clock3 },
    { label: "Identification", value: `${formatter.format(identificationRate)} %`, detail: `${identified} pièces identifiées`, icon: BadgeCheck },
    { label: "Transmission", value: `${formatter.format(sentRate)} %`, detail: `${sent} pièces envoyées`, icon: Send },
  ]

  return <div className="w-full space-y-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-medium text-teal-700 dark:text-teal-400">Pilotage de production</p><h1 className="text-3xl font-bold tracking-tight">Analyse des traitements</h1><p className="mt-1 text-muted-foreground">Indicateurs calculés directement par PostgreSQL, sans transférer les 10 000 lignes.</p></div>
      <Badge variant="outline" className="w-fit gap-2 px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Données à jour</Badge>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Card key={card.label}><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{card.label}</p><p className="mt-2 text-2xl font-bold">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.detail}</p></div><div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 dark:bg-teal-950 dark:text-teal-300"><card.icon className="h-5 w-5" /></div></CardContent></Card>)}</div>
    {total === 0 ? <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><Gauge className="mb-3 h-10 w-10 text-muted-foreground" /><p className="font-semibold">Aucune donnée à analyser</p></CardContent></Card> : <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base">Activité des 14 derniers jours</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={dailyData} margin={{ left: -24, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend /><Line type="monotone" dataKey="processed" name="Pièces traitées" stroke="#0f766e" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="identified" name="Identifiées" stroke="#2563eb" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">État du flux</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>{statusData.map((item, index) => <Cell key={item.name} fill={colors[index]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend verticalAlign="bottom" /></PieChart></ResponsiveContainer></CardContent></Card>
      <Card className="xl:col-span-2"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Ruler className="h-4 w-4" /> Dimensions moyennes (mm)</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={dimensionData} margin={{ left: -12 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="dimension" tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${formatter.format(value)} mm`} /><Bar dataKey="average" name="Moyenne" fill="#0f766e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Derniers traitements</CardTitle></CardHeader><CardContent className="space-y-4">{latest.map((image) => <div key={image.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{image.customId || `Pièce #${image.id}`}</p><p className="text-xs text-muted-foreground">{new Date(image.createdAt).toLocaleString("fr-FR")}</p></div><Badge variant={image.sent ? "default" : image.customId ? "secondary" : "outline"}>{image.sent ? "Envoyée" : image.customId ? "Prête" : "À identifier"}</Badge></div>)}</CardContent></Card>
    </div>}
  </div>
}
