"use client"

import {
  Activity,
  BadgeCheck,
  Clock3,
  Gauge,
  Ruler,
  Send,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ImageRecord = {
  id: number
  customId: string | null
  sent: boolean
  createdAt: string
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
  w1: number
  w2: number
  w3: number
}

const COLORS = ["#0f766e", "#d97706", "#2563eb"]
const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 })

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

export function AnalyticsDashboard({ images }: { images: ImageRecord[] }) {
  const now = new Date()
  const today = startOfDay(now)
  const lastSevenDays = new Date(today)
  lastSevenDays.setDate(lastSevenDays.getDate() - 6)

  const todayCount = images.filter((image) => new Date(image.createdAt) >= today).length
  const weekCount = images.filter((image) => new Date(image.createdAt) >= lastSevenDays).length
  const identified = images.filter((image) => image.customId).length
  const sent = images.filter((image) => image.sent).length
  const identificationRate = images.length ? (identified / images.length) * 100 : 0
  const sentRate = images.length ? (sent / images.length) * 100 : 0

  const dailyData = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(today)
    day.setDate(day.getDate() - (13 - index))
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const records = images.filter((image) => {
      const date = new Date(image.createdAt)
      return date >= day && date < nextDay
    })
    return {
      label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      traites: records.length,
      identifies: records.filter((record) => record.customId).length,
    }
  })

  const dimensions = ["l1", "l2", "l3", "l4", "l5", "w1", "w2", "w3"] as const
  const dimensionData = dimensions.map((dimension) => ({
    dimension: dimension.toUpperCase(),
    moyenne: images.length
      ? images.reduce((sum, image) => sum + image[dimension], 0) / images.length
      : 0,
  }))

  const statusData = [
    { name: "Envoyées", value: sent },
    { name: "Prêtes", value: identified - sent },
    { name: "À identifier", value: images.length - identified },
  ].filter((item) => item.value > 0)

  const latest = [...images].reverse().slice(0, 5)

  const cards = [
    { label: "Total traité", value: images.length, detail: `${todayCount} aujourd’hui`, icon: Activity },
    { label: "Cette semaine", value: weekCount, detail: "7 derniers jours", icon: Clock3 },
    { label: "Identification", value: `${number.format(identificationRate)} %`, detail: `${identified} pièces identifiées`, icon: BadgeCheck },
    { label: "Transmission", value: `${number.format(sentRate)} %`, detail: `${sent} pièces envoyées`, icon: Send },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Pilotage de production</p>
          <h1 className="text-3xl font-bold tracking-tight">Analyse des traitements</h1>
          <p className="mt-1 text-muted-foreground">Volumes, identification et transmission des tôles mesurées.</p>
        </div>
        <Badge variant="outline" className="w-fit gap-2 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Données à jour
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </div>
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><card.icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 ? (
        <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
          <Gauge className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold">Aucune donnée à analyser</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Les indicateurs apparaîtront automatiquement dès qu’une première image aura été traitée.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-base">Activité des 14 derniers jours</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ left: -24, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="traites" name="Pièces traitées" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="identifies" name="Identifiées" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">État du flux</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
                    {statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Ruler className="h-4 w-4" /> Dimensions moyennes (mm)</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionData} margin={{ left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dimension" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number) => `${number.format(value)} mm`} />
                  <Bar dataKey="moyenne" name="Moyenne" fill="#0f766e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Derniers traitements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {latest.map((image) => (
                <div key={image.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{image.customId || `Pièce #${image.id}`}</p>
                    <p className="text-xs text-muted-foreground">{new Date(image.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                  <Badge variant={image.sent ? "default" : image.customId ? "secondary" : "outline"}>
                    {image.sent ? "Envoyée" : image.customId ? "Prête" : "À identifier"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
