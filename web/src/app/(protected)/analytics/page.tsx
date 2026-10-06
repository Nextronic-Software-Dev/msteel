import { db } from "@/lib/db"
import { OptimizedAnalyticsDashboard } from "./optimized-analytics-dashboard"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 6)
  const chartStart = new Date(today)
  chartStart.setDate(chartStart.getDate() - 13)

  const [aggregate, identified, sent, todayCount, weekCount, recentForChart, latest] = await Promise.all([
    db.processedImage.aggregate({
      _count: { _all: true },
      _avg: { l1: true, l2: true, l3: true, l4: true, l5: true, w1: true, w2: true, w3: true },
    }),
    db.processedImage.count({ where: { customId: { not: null } } }),
    db.processedImage.count({ where: { sent: true } }),
    db.processedImage.count({ where: { createdAt: { gte: today } } }),
    db.processedImage.count({ where: { createdAt: { gte: weekStart } } }),
    db.processedImage.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { createdAt: true, customId: true },
      orderBy: { createdAt: "asc" },
    }),
    db.processedImage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, customId: true, sent: true, createdAt: true },
    }),
  ])

  const dailyData = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(chartStart)
    day.setDate(day.getDate() + index)
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const records = recentForChart.filter((record) => record.createdAt >= day && record.createdAt < nextDay)
    return {
      label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      processed: records.length,
      identified: records.filter((record) => record.customId).length,
    }
  })

  const dimensionData = (["l1", "l2", "l3", "l4", "l5", "w1", "w2", "w3"] as const).map((key) => ({
    dimension: key.toUpperCase(),
    average: aggregate._avg[key] ?? 0,
  }))

  return (
    <OptimizedAnalyticsDashboard
      total={aggregate._count._all}
      identified={identified}
      sent={sent}
      todayCount={todayCount}
      weekCount={weekCount}
      dailyData={dailyData}
      dimensionData={dimensionData}
      latest={latest.map((image) => ({ ...image, createdAt: image.createdAt.toISOString() }))}
    />
  )
}
